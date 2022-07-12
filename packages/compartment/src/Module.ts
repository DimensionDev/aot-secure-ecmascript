import type { ModuleSource } from './ModuleSource.js'
import type { ModuleNamespace, SyntheticModuleRecord, SyntheticModuleRecordInitializeContext } from './types.js'
import { empty, PromiseCapability } from './utils/spec.js'
import { normalizeSyntheticModuleRecord } from './utils/normalize.js'
import { assert } from './utils/opaqueProxy.js'
import { hasFromField, isExportBinding, isStarBinding } from './utils/shapeCheck.js'

export type ImportHook = (importSpecifier: string, importMeta: object) => PromiseLike<Module>
export let imports: (specifier: Module, options: ImportCallOptions) => Promise<ModuleNamespace>

export class Module {
    constructor(source: ModuleSource | SyntheticModuleRecord, importHook: ImportHook, importMeta: object) {
        if (typeof importHook !== 'function') throw new TypeError('importHook must be a function')
        if (typeof importMeta !== 'object') throw new TypeError('importMeta must be an object')
        // impossible to create a ModuleSource instance
        source = source as SyntheticModuleRecord
        const module = (this.#NormalizedSyntheticModuleRecord = normalizeSyntheticModuleRecord(source))
        this.#AssignedImportMeta = importMeta
        this.#ImportHook = importHook
        this.#RequestedModules = module.bindings?.filter(hasFromField).map((x) => x.from) || []

        // TODO: static analysis of TLA
        this.#HasTLA = true
        this.#AsyncEvaluation = true
    }
    //#region ModuleRecord fields https://tc39.es/ecma262/#table-module-record-fields
    // #Realm: unknown
    // #Environment: unknown
    #Namespace: ModuleNamespace | undefined
    // #HostDefined: unknown
    //#endregion

    // #region SyntheticModuleRecord fields
    #NormalizedSyntheticModuleRecord: SyntheticModuleRecord
    #ImportHook: ImportHook
    // 3rd argument of Module constructor
    #AssignedImportMeta: object
    #ReferencedModules = new Map<string, Module>()
    #FetchError: SyntaxError | undefined
    #FetchFinished = false
    #LocalExportEntries = new Map<string, unknown>()
    //#endregion

    //#region SyntheticModuleRecord methods
    //#endregion

    //#region ModuleRecord methods https://tc39.es/ecma262/#table-abstract-methods-of-module-records
    // https://tc39.es/ecma262/#sec-getexportednames
    #GetExportedNames(exportStarSet?: Module[]): string[] {
        if (!exportStarSet) exportStarSet = []
        if (exportStarSet.includes(this)) return []
        exportStarSet.push(this)
        const exportedNames: string[] = []
        this.#NormalizedSyntheticModuleRecord.bindings?.filter(isExportBinding).forEach((binding) => {
            exportedNames.push(binding.as ?? binding.export)
        })
        this.#NormalizedSyntheticModuleRecord.bindings?.filter(isStarBinding).forEach((binding) => {
            const requestedModule = Module.#HostResolveImportedModule(this, binding.from!)
            const starNames = requestedModule.#GetExportedNames(exportStarSet)
            for (const n of starNames) {
                if (n === 'default') continue
                if (exportedNames.includes(n)) continue
                exportedNames.push(n)
            }
        })
        return exportedNames
    }
    // TODO:
    #ResolveExport(exportName: string, resolveSet?: any) {}
    //#endregion

    //#region CyclicModuleRecord fields https://tc39.es/ecma262/#sec-cyclic-module-records
    #Status = ModuleStatus.unlinked
    #EvaluationError: unknown | empty = empty
    #DFSIndex: number | empty = empty
    #DFSAncestorIndex: number | empty = empty
    #RequestedModules: string[]
    #CycleRoot: Module | undefined
    #HasTLA: boolean
    #AsyncEvaluation: boolean
    #TopLevelCapability: PromiseCapability<void> | undefined
    #AsyncParentModules: Module[] = []
    #PendingAsyncDependencies: number | empty = empty
    //#endregion

    //#region CyclicModuleRecord methods https://tc39.es/ecma262/#table-cyclic-module-methods
    // https://tc39.es/ecma262/#sec-source-text-module-record-initialize-environment
    // TODO:
    #InitializeEnvironment() {}
    // https://tc39.es/ecma262/#sec-source-text-module-record-execute-module
    #ExecuteModule(promise?: PromiseCapability<void>) {
        // prepare context
        const context: SyntheticModuleRecordInitializeContext = {}
        if (this.#NormalizedSyntheticModuleRecord.needsImportMeta) {
            context.importMeta = Object.assign({}, this.#AssignedImportMeta)
        }
        if (this.#NormalizedSyntheticModuleRecord.needsImport) {
            context.import = async (specifier: string, options: ImportCallOptions) => {
                const module = await this.#ImportHook(specifier, this.#AssignedImportMeta)
                module.#Link()
                await module.#Evaluate()
                // TODO:
                return {}
            }
        }
        // assert
        if (!this.#HasTLA) {
            assert(!promise)
            // TODO:
            this.#NormalizedSyntheticModuleRecord.initialize({}, context)
        } else {
            assert(promise)
            // TODO:
            Promise.resolve(this.#NormalizedSyntheticModuleRecord.initialize({}, context)).then(
                promise.Resolve,
                promise.Reject,
            )
        }
    }
    // https://tc39.es/ecma262/#sec-moduledeclarationlinking
    #Link() {
        const module = this
        assert(![ModuleStatus.linking, ModuleStatus.evaluating].includes(module.#Status))
        const stack: Module[] = []
        try {
            Module.#InnerModuleLinking(module, stack, 0)
        } catch (err) {
            for (const mod of stack) {
                assert(mod.#Status === ModuleStatus.linking)
                mod.#Status = ModuleStatus.unlinked
            }
            assert(module.#Status === ModuleStatus.unlinked)
            throw err
        }
        assert([ModuleStatus.linked, ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status))
        assert(stack.length === 0)
    }

    // https://tc39.es/ecma262/#sec-moduleevaluation
    #Evaluate() {
        let module: Module = this
        // TODO: Assert: This call to Evaluate is not happening at the same time as another call to Evaluate within the surrounding agent.
        assert([ModuleStatus.linked, ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status))
        if ([ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status)) {
            module = module.#CycleRoot!
        }
        if (module.#TopLevelCapability) return module.#TopLevelCapability
        const stack: Module[] = []
        const capability = PromiseCapability<void>()
        module.#TopLevelCapability = capability
        try {
            Module.#InnerModuleEvaluation(module, stack, 0)
        } catch (err) {
            for (const m of stack) {
                assert(m.#Status === ModuleStatus.evaluating)
                m.#Status = ModuleStatus.evaluated
                m.#EvaluationError = err
            }
            assert(module.#Status === ModuleStatus.evaluated)
            assert(module.#EvaluationError === err)
            capability.Reject(err)
            return capability.Promise
        }
        assert([ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status))
        assert(module.#EvaluationError === empty)
        if (module.#AsyncEvaluation === false) {
            assert(module.#Status === ModuleStatus.evaluated)
            capability.Resolve()
        }
        assert(stack.length === 0)
        return capability.Promise
    }

    // https://tc39.es/ecma262/#sec-InnerModuleLinking
    static #InnerModuleLinking(module: Module, stack: Module[], index: number) {
        if (
            [ModuleStatus.linking, ModuleStatus.linked, ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(
                module.#Status,
            )
        ) {
            return index
        }
        assert(module.#Status === ModuleStatus.unlinked)
        module.#Status = ModuleStatus.linking
        module.#DFSIndex = index
        module.#DFSAncestorIndex = index
        index++
        stack.push(module)
        for (const required of module.#RequestedModules) {
            const requiredModule = this.#HostResolveImportedModule(module, required)
            index = this.#InnerModuleLinking(requiredModule, stack, index)
            assert(
                [
                    ModuleStatus.linking,
                    ModuleStatus.linked,
                    ModuleStatus.evaluatingAsync,
                    ModuleStatus.evaluated,
                ].includes(requiredModule.#Status),
            )
            if (stack.includes(module)) {
                assert(requiredModule.#Status === ModuleStatus.linking)
            } else {
                assert(requiredModule.#Status !== ModuleStatus.linking)
            }
            if (requiredModule.#Status === ModuleStatus.linking) {
                module.#DFSAncestorIndex = Math.min(
                    module.#DFSAncestorIndex,
                    requiredModule.#DFSAncestorIndex as number,
                )
            }
        }
        module.#InitializeEnvironment()
        assert(stack.filter((x) => x === module).length === 1)
        assert(module.#DFSAncestorIndex <= module.#DFSIndex)
        if (module.#DFSAncestorIndex === module.#DFSIndex) {
            let done = false
            while (!done) {
                const requiredModule = stack.pop()!
                requiredModule.#Status = ModuleStatus.linked
                if (requiredModule === module) done = true
            }
        }
        return index
    }

    // https://tc39.es/ecma262/#sec-InnerModuleEvaluation
    static #InnerModuleEvaluation(module: Module, stack: Module[], index: number) {
        if ([ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status)) {
            if (module.#EvaluationError === empty) return index
            throw module.#EvaluationError
        }
        if (module.#Status === ModuleStatus.evaluating) return index
        assert(module.#Status === ModuleStatus.linked)
        module.#Status = ModuleStatus.evaluating
        module.#DFSIndex = index
        module.#DFSAncestorIndex = index
        module.#PendingAsyncDependencies = 0
        index++
        stack.push(module)
        for (const required of module.#RequestedModules) {
            let requiredModule = this.#HostResolveImportedModule(module, required)
            index = this.#InnerModuleEvaluation(requiredModule, stack, index)
            assert(
                [ModuleStatus.evaluating, ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(
                    requiredModule.#Status,
                ),
            )
            if (requiredModule.#Status === ModuleStatus.evaluating) {
                module.#DFSAncestorIndex = Math.min(
                    module.#DFSAncestorIndex,
                    requiredModule.#DFSAncestorIndex as number,
                )
            } else {
                requiredModule = requiredModule.#CycleRoot!
                assert([ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(requiredModule.#Status))
                if (requiredModule.#EvaluationError !== empty) throw requiredModule.#EvaluationError
            }
            if (requiredModule.#AsyncEvaluation) {
                module.#PendingAsyncDependencies++
                requiredModule.#AsyncParentModules.push(module)
            }
        }
        if (module.#PendingAsyncDependencies > 0 || module.#HasTLA) {
            assert(module.#AsyncEvaluation === false)
            module.#AsyncEvaluation = true
            if (module.#PendingAsyncDependencies === 0) {
                this.#ExecuteAsyncModule(module)
            }
        } else {
            module.#ExecuteModule()
        }
        assert(stack.filter((x) => x === module).length === 1)
        assert(module.#DFSAncestorIndex <= module.#DFSIndex)
        if (module.#DFSAncestorIndex === module.#DFSIndex) {
            let done = false
            while (!done) {
                const requiredModule = stack.pop()!
                if (requiredModule.#AsyncEvaluation === false) {
                    requiredModule.#Status = ModuleStatus.evaluated
                } else {
                    requiredModule.#Status = ModuleStatus.evaluatingAsync
                }
                if (requiredModule === module) done = true
                requiredModule.#CycleRoot = module
            }
        }
        return index
    }

    // https://tc39.es/ecma262/#sec-execute-async-module
    static #ExecuteAsyncModule(module: Module) {
        assert([ModuleStatus.evaluating, ModuleStatus.evaluatingAsync].includes(module.#Status))
        assert(module.#HasTLA)
        const capability = PromiseCapability<void>()
        capability.Promise.then(
            () => {
                this.#AsyncModuleExecutionFulfilled(module)
            },
            (error) => {
                this.#AsyncModuleExecutionRejected(module, error)
            },
        )
        module.#ExecuteModule(capability)
    }

    // https://tc39.es/ecma262/#sec-gather-available-ancestors
    static #GatherAvailableAncestors(module: Module, execList: Module[]) {
        for (const m of module.#AsyncParentModules) {
            if (!execList.includes(m) && m.#CycleRoot!.#EvaluationError === empty) {
                assert(m.#Status === ModuleStatus.evaluatingAsync)
                assert(m.#EvaluationError === empty)
                assert(m.#AsyncEvaluation)
                assert(typeof m.#PendingAsyncDependencies === 'number' && m.#PendingAsyncDependencies > 0)
                m.#PendingAsyncDependencies--
                if (m.#PendingAsyncDependencies === 0) {
                    execList.push(m)
                    if (!m.#HasTLA) this.#GatherAvailableAncestors(m, execList)
                }
            }
        }
    }

    // https://tc39.es/ecma262/#sec-async-module-execution-fulfilled
    static #AsyncModuleExecutionFulfilled(module: Module) {
        if (module.#Status === ModuleStatus.evaluated) {
            assert(module.#EvaluationError !== empty)
            return
        }
        assert(module.#Status === ModuleStatus.evaluatingAsync)
        assert(module.#AsyncEvaluation)
        assert(module.#EvaluationError === empty)
        module.#AsyncEvaluation = false
        module.#Status = ModuleStatus.evaluated
        if (module.#TopLevelCapability) {
            assert(module.#CycleRoot === module)
            module.#TopLevelCapability.Resolve()
        }
        const execList: Module[] = []
        this.#GatherAvailableAncestors(module, execList)
        // TODO: Let sortedExecList be a List whose elements are the elements of execList, in the order in which they had their [[AsyncEvaluation]] fields set to true in InnerModuleEvaluation.
        const sortedExecList = execList
        assert(
            sortedExecList.every(
                (x) => x.#AsyncEvaluation && x.#PendingAsyncDependencies === 0 && x.#EvaluationError === empty,
            ),
        )
        for (const m of sortedExecList) {
            if (m.#Status === ModuleStatus.evaluated) {
                assert(m.#EvaluationError !== empty)
            } else if (m.#HasTLA) {
                this.#ExecuteAsyncModule(m)
            } else {
                try {
                    m.#ExecuteModule()
                } catch (err) {
                    this.#AsyncModuleExecutionRejected(m, err)
                    continue
                }
                m.#Status = ModuleStatus.evaluated
                if (m.#TopLevelCapability) {
                    assert(m.#CycleRoot === m)
                    m.#TopLevelCapability.Resolve()
                }
            }
        }
    }

    // https://tc39.es/ecma262/#sec-async-module-execution-rejected
    static #AsyncModuleExecutionRejected = (module: Module, error: unknown) => {
        if (module.#Status === ModuleStatus.evaluated) {
            assert(module.#EvaluationError !== empty)
            return
        }
        assert(module.#Status === ModuleStatus.evaluatingAsync)
        assert(module.#AsyncEvaluation)
        assert(module.#EvaluationError === empty)
        module.#EvaluationError = error
        module.#Status = ModuleStatus.evaluated
        for (const m of module.#AsyncParentModules) {
            this.#AsyncModuleExecutionRejected(m, error)
        }
        if (module.#TopLevelCapability) {
            assert(module.#CycleRoot === module)
            module.#TopLevelCapability.Reject(error)
        }
    }
    static #HostResolveImportedModule(module: Module, spec: string) {
        const rec = module.#ReferencedModules.get(spec)
        assert(rec)
        return rec
    }
    //#endregion

    static {
        // call importHook recursively to get all module referenced.
        async function HostResolveModule(module: Module) {
            if (module.#FetchError) throw module.#FetchError
            if (module.#FetchFinished) return
            if (!module.#NormalizedSyntheticModuleRecord.bindings) {
                module.#FetchFinished = true
                return
            }

            const referredModules = Array.from(
                new Set(module.#NormalizedSyntheticModuleRecord.bindings.filter(hasFromField).map((x) => x.from)),
            )
            const promises = referredModules.map(async (spec) => {
                try {
                    const ref = await module.#ImportHook(spec, module.#AssignedImportMeta)
                    if (!(#HasTLA in ref)) throw new TypeError('importHook must return a Module instance')
                    module.#ReferencedModules.set(spec, ref)
                    await HostResolveModule(ref)
                    if (ref.#FetchError) throw ref.#FetchError
                } catch (error) {
                    module.#FetchError ||= new SyntaxError(
                        `Failed to fetch ${spec}`,
                        // @ts-expect-error
                        { cause: err },
                    )
                }
            })
            await Promise.all(promises)
            if (module.#FetchError) throw module.#FetchError
        }
        imports = async (module, options) => {
            await HostResolveModule(module)
            module.#Link()
            await module.#Evaluate()
            // TODO:
            return {}
        }
    }
}
function makeMutableNamespaceExoticObject(exports: string[]) {
    const namespace: ModuleNamespace = { __proto__: null }
    Object.defineProperty(namespace, Symbol.toStringTag, { value: 'Module' })
    Object.defineProperties(
        namespace,
        Object.fromEntries(
            exports.map((exportName): [string, PropertyDescriptor] => [
                exportName,
                {
                    enumerable: true,
                    writable: true,
                    value: undefined,
                },
            ]),
        ),
    )
    Object.seal(namespace)
    return namespace
}

const enum ModuleStatus {
    unlinked,
    linking,
    linked,
    evaluating,
    evaluatingAsync,
    evaluated,
}

const moduleNamespaceExoticMethods: ProxyHandler<any> = {
    // https://tc39.es/ecma262/#sec-module-namespace-exotic-objects
    setPrototypeOf(target, prototype) {
        return prototype === null
    },
    defineProperty(target, p, attributes) {
        if (typeof p === 'symbol') return Reflect.defineProperty(target, p, attributes)
        const current = Reflect.getOwnPropertyDescriptor(target, p)
        if (!current) return false
        if (attributes.configurable) return false
        if (attributes.enumerable === false) return false
        if (attributes.get || current.set) return false
        if (attributes.writable === false) return false
        if ('value' in attributes) return Object.is(current.value, attributes.value)
        return true
    },
    set() {
        return false
    },
}
