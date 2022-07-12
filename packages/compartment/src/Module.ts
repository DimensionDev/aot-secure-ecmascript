import type { ModuleSource } from './ModuleSource.js'
import type { ModuleNamespace, SyntheticModuleRecord, SyntheticModuleRecordInitializeContext } from './types.js'
import { all, allButDefault, ambiguous, empty, namespace, PromiseCapability } from './utils/spec.js'
import { normalizeSyntheticModuleRecord } from './utils/normalize.js'
import { assert } from './utils/opaqueProxy.js'
import { hasFromField, isImportBinding, isStarBinding } from './utils/shapeCheck.js'

export type ImportHook = (importSpecifier: string, importMeta: object) => PromiseLike<Module>
export let imports: (specifier: Module, options: ImportCallOptions) => Promise<ModuleNamespace>

export class Module {
    constructor(source: ModuleSource | SyntheticModuleRecord, importHook: ImportHook, importMeta: object) {
        if (typeof importHook !== 'function') throw new TypeError('importHook must be a function')
        if (typeof importMeta !== 'object') throw new TypeError('importMeta must be an object')
        // impossible to create a ModuleSource instance
        source = source as SyntheticModuleRecord

        const module = normalizeSyntheticModuleRecord(source)
        this.#Initialize = module.initialize
        this.#NeedsImport = module.needsImport
        this.#NeedsImportMeta = module.needsImportMeta
        // TODO: static analysis of TLA
        this.#HasTLA = true

        this.#AssignedImportMeta = importMeta
        this.#ImportHook = importHook
        const requestedModules: string[] = []

        const imports: ModuleImportEntry[] = (this.#ImportEntries = [])
        const localExports: ModuleExportEntry[] = (this.#LocalExportEntries = [])
        const indirectExports: ModuleExportEntry[] = (this.#IndirectExportEntries = [])
        const starExports: ModuleExportEntry[] = (this.#StarExportEntries = [])

        for (const binding of module.bindings || []) {
            if (isImportBinding(binding)) {
                requestedModules.push(binding.from)
                imports.push({
                    ImportName: isStarBinding(binding) ? namespace : binding.import,
                    LocalName: binding.as ?? binding.import,
                    ModuleRequest: binding.from,
                })
            } else {
                if (hasFromField(binding)) {
                    requestedModules.push(binding.from)
                    if (isStarBinding(binding)) {
                        if (typeof binding.as === 'string') {
                            // export * as name from 'mod'
                            starExports.push({
                                LocalName: binding.as,
                                ExportName: null,
                                ImportName: all,
                                ModuleRequest: binding.from,
                            })
                        } else {
                            // export * from 'mod'
                            starExports.push({
                                LocalName: null,
                                ExportName: null,
                                ImportName: allButDefault,
                                ModuleRequest: binding.from,
                            })
                        }
                    } else {
                        indirectExports.push({
                            ExportName: binding.as ?? binding.export,
                            ImportName: binding.export,
                            LocalName: null,
                            ModuleRequest: binding.from,
                        })
                    }
                } else {
                    localExports.push({
                        ExportName: binding.as ?? binding.export,
                        LocalName: binding.export,
                        ImportName: null,
                        ModuleRequest: null,
                    })
                }
            }
        }
        // Set is ordered.
        this.#RequestedModules = [...new Set(requestedModules)]
        // TODO: check duplicate import/export

        // TODO:
        this.#AsyncEvaluation = true
    }
    //#region ModuleRecord fields https://tc39.es/ecma262/#table-module-record-fields
    // #Realm: unknown
    #Environment!: object
    #Namespace: ModuleNamespace | undefined
    // #HostDefined: unknown = undefined
    //#endregion

    // #region SyntheticModuleRecord fields
    #Initialize: SyntheticModuleRecord['initialize']
    #NeedsImportMeta: boolean | undefined
    #NeedsImport: boolean | undefined
    #ImportHook: ImportHook
    #AssignedImportMeta: object
    // TODO:
    #GlobalThis: typeof globalThis = globalThis
    #ReferencedModules = new Map<string, Module>()
    #FetchError: SyntaxError | undefined
    #FetchFinished = false
    #ImportEntries: ModuleImportEntry[]
    #LocalExportEntries: ModuleExportEntry[]
    #IndirectExportEntries: ModuleExportEntry[]
    #StarExportEntries: ModuleExportEntry[]
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
        for (const e of this.#LocalExportEntries) {
            assert(e.ExportName)
            exportedNames.push(e.ExportName)
        }
        for (const e of this.#IndirectExportEntries) {
            assert(e.ExportName)
            exportedNames.push(e.ExportName)
        }
        for (const e of this.#StarExportEntries) {
            assert(e.ModuleRequest)
            const requestedModule = Module.#HostResolveImportedModule(this, e.ModuleRequest)
            const starNames = requestedModule.#GetExportedNames(exportStarSet)
            for (const n of starNames) {
                if (n === 'default') continue
                if (exportedNames.includes(n)) continue
                exportedNames.push(n)
            }
        }
        return exportedNames
    }
    // https://tc39.es/ecma262/#sec-resolveexport
    #ResolveExport(
        exportName: string,
        resolveSet?: { module: Module; exportName: string }[],
    ): typeof ambiguous | { module: Module; bindingName: string | typeof namespace } | null {
        const module = this
        if (!resolveSet) resolveSet = []
        for (const r of resolveSet) {
            if (module === r.module && exportName === r.exportName) {
                // Assert: This is a circular import request.
                return null
            }
        }
        resolveSet.push({ module, exportName })
        for (const e of module.#LocalExportEntries) {
            if (exportName === e.ExportName) {
                assert(e.LocalName)
                return { module, bindingName: e.LocalName }
            }
        }
        for (const e of module.#IndirectExportEntries) {
            if (exportName === e.ExportName) {
                assert(e.ModuleRequest)
                const importedModule = Module.#HostResolveImportedModule(module, e.ModuleRequest)
                if (e.ImportName === all) {
                    // Assert: module does not provide the direct binding for this export.
                    return { module: importedModule, bindingName: namespace }
                } else {
                    assert(e.ImportName && e.ImportName !== allButDefault)
                    return importedModule.#ResolveExport(e.ImportName, resolveSet)
                }
            }
        }
        if (exportName === 'default') {
            // Assert: A default export was not explicitly provided by this module.
            // Note: A default export cannot be provided by an export * from "mod" declaration.
            return null
        }
        let starResolution = null
        for (const e of module.#StarExportEntries) {
            assert(e.ModuleRequest)
            const importedModule = Module.#HostResolveImportedModule(module, e.ModuleRequest)
            let resolution = importedModule.#ResolveExport(exportName, resolveSet)
            if (resolution === ambiguous) return ambiguous
            if (resolution !== null) {
                if (starResolution === null) starResolution = resolution
                else {
                    // Assert: There is more than one * import that includes the requested name.
                    if (resolution.module !== starResolution.module) return ambiguous
                    if (
                        (resolution.bindingName === namespace && starResolution.bindingName !== namespace) ||
                        (resolution.bindingName !== namespace && starResolution.bindingName === namespace)
                    )
                        return ambiguous
                    if (
                        typeof resolution.bindingName === 'string' &&
                        typeof starResolution.bindingName === 'string' &&
                        resolution.bindingName !== starResolution.bindingName
                    ) {
                        return ambiguous
                    }
                }
            }
        }
        return starResolution
    }
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
    #InitializeEnvironment() {
        const module = this
        for (const e of module.#IndirectExportEntries) {
            assert(e.ExportName)
            const resolution = module.#ResolveExport(e.ExportName)
            if (resolution === null || resolution === ambiguous)
                throw new SyntaxError(`Module has an invalid import ${e.ExportName}`)
        }
        // Assert: All named exports from module are resolvable.
        const env = { __proto__: null }
        module.#Environment = env
        for (const i of module.#ImportEntries) {
            const importedModule = Module.#HostResolveImportedModule(module, i.ModuleRequest)
            if (i.ImportName === namespace) {
                const namespaceObject = Module.#GetModuleNamespace(importedModule)
                Object.defineProperty(env, i.LocalName, { value: namespaceObject })
            } else {
                const resolution = importedModule.#ResolveExport(i.ImportName)
                if (resolution === null || resolution === ambiguous) {
                    throw new SyntaxError(`Module has an invalid import ${i.ImportName}`)
                }
                if (resolution.bindingName === namespace) {
                    const namespaceObject = Module.#GetModuleNamespace(resolution.module)
                    Object.defineProperty(env, i.LocalName, { value: namespaceObject })
                } else {
                    // TODO: live binding
                    Object.defineProperty(env, i.LocalName, { value: resolution.bindingName, configurable: true })
                }
            }
        }
        // TODO: export bindings
        Object.setPrototypeOf(env, module.#GlobalThis)
        // TODO: Two-pass initialization of module, here is var and function.
    }
    // https://tc39.es/ecma262/#sec-source-text-module-record-execute-module
    #ExecuteModule(promise?: PromiseCapability<void>) {
        // prepare context
        const context: SyntheticModuleRecordInitializeContext = {}
        if (this.#NeedsImportMeta) {
            context.importMeta = Object.assign({}, this.#AssignedImportMeta)
        }
        if (this.#NeedsImport) {
            context.import = async (specifier: string, options: ImportCallOptions) => {
                const module = await this.#ImportHook(specifier, this.#AssignedImportMeta)
                module.#Link()
                await module.#Evaluate()
                return Module.#GetModuleNamespace(module)
            }
        }
        const init = this.#Initialize
        if (!this.#HasTLA) {
            assert(!promise)
            init(this.#Environment, context)
        } else {
            assert(promise)
            Promise.resolve(init(this.#Environment, context)).then(promise.Resolve, promise.Reject)
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
            assert(module) // TODO: https://github.com/tc39/ecma262/issues/2823
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

    static #GetModuleNamespace(module: Module): ModuleNamespace {
        assert(module.#Status !== ModuleStatus.unlinked)
        if (!module.#Namespace) {
            const exportedNames = module.#GetExportedNames()
            const unambiguousNames = []
            for (const name of exportedNames) {
                const resolution = module.#ResolveExport(name)
                if (typeof resolution === 'object' && resolution !== null) {
                    unambiguousNames.push(name)
                }
            }
            const raw = makeMutableNamespaceExoticObject(exportedNames)
            module.#Namespace = new Proxy(raw, moduleNamespaceExoticMethods)
        }
        return module.#Namespace!
    }
    //#endregion

    static {
        // call importHook recursively to get all module referenced.
        async function HostResolveModule(module: Module) {
            if (module.#FetchError) throw module.#FetchError
            if (module.#FetchFinished) return

            const promises = module.#RequestedModules.map(async (spec) => {
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
            return Module.#GetModuleNamespace(module)
        }
    }
}
function makeMutableNamespaceExoticObject(exports: string[]) {
    const namespace: ModuleNamespace = { __proto__: null }
    Object.defineProperty(namespace, Symbol.toStringTag, { value: 'Module' })
    // TODO: live binding
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

interface ModuleImportEntry {
    ModuleRequest: string
    ImportName: string | typeof namespace
    LocalName: string
}
interface ModuleExportEntry {
    ExportName: string | null
    ModuleRequest: string | null
    ImportName: string | typeof all | typeof allButDefault | null
    LocalName: string | null
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
