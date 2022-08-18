import type { ModuleSource } from './ModuleSource.js'
import type {
    ImportHook,
    ModuleNamespace,
    Referral,
    VirtualModuleRecord,
    VirtualModuleRecordExecuteContext,
} from './types.js'
import {
    all,
    ambiguous,
    empty,
    namespace,
    PromiseCapability,
    type ModuleExportEntry,
    type ModuleImportEntry,
} from './utils/spec.js'
import { normalizeBindingsToSpecRecord, normalizeVirtualModuleRecord } from './utils/normalize.js'
import { assert, internalError, opaqueProxy } from './utils/assert.js'
import { defaultImportHook } from './Evaluators.js'

export let imports: <T extends object = any>(specifier: Module<T>, options?: ImportCallOptions) => Promise<T>
/** @internal */
export let setGlobalThis: (module: Module, global: object) => void

export class Module<T extends object = any> {
    // The constructor is equivalent to ParseModule in SourceTextModuleRecord
    // https://tc39.es/ecma262/#sec-parsemodule
    constructor(
        moduleSource: ModuleSource<T> | VirtualModuleRecord,
        referral: Referral,
        // it actually NOT an optional argument when it is the top-level Module.
        importHook: ImportHook = defaultImportHook,
        importMeta?: object,
    ) {
        if (typeof moduleSource !== 'object') throw new TypeError('moduleSource must be an object')
        if (typeof importHook !== 'function') throw new TypeError('importHook must be a function')

        let assignedImportMeta: null | object
        if (importMeta === undefined) assignedImportMeta = null
        else if (typeof importMeta !== 'object') throw new TypeError('importMeta must be an object')
        else assignedImportMeta = importMeta

        // impossible to create a ModuleSource instance
        const module = normalizeVirtualModuleRecord(moduleSource as VirtualModuleRecord)

        this.#Source = moduleSource
        this.#Referral = referral
        this.#Execute = module.execute
        this.#NeedsImport = module.needsImport
        this.#NeedsImportMeta = module.needsImportMeta
        this.#HasTLA = !!module.isAsync

        this.#AssignedImportMeta = importMeta ?? null
        this.#ImportHook = importHook

        const { importEntries, indirectExportEntries, localExportEntries, requestedModules, starExportEntries } =
            normalizeBindingsToSpecRecord(module.bindings)
        this.#ImportEntries = importEntries
        this.#IndirectExportEntries = indirectExportEntries
        this.#LocalExportEntries = localExportEntries
        this.#RequestedModules = requestedModules
        this.#StarExportEntries = starExportEntries
    }
    get source(): ModuleSource | VirtualModuleRecord | null {
        return this.#Source
    }
    //#region ModuleRecord fields https://tc39.es/ecma262/#table-module-record-fields
    // #Realm: unknown
    /** first argument of execute() */
    #Environment: object | undefined
    /** result of await import(mod) */
    #Namespace: ModuleNamespace | undefined
    // #HostDefined: unknown = undefined
    //#endregion

    // #region VirtualModuleRecord fields
    // *this value* when calling #Execute.
    #Referral: Referral
    #Source: VirtualModuleRecord
    #Execute: VirtualModuleRecord['execute']
    #NeedsImportMeta: boolean | undefined
    #NeedsImport: boolean | undefined
    #ContextObject: VirtualModuleRecordExecuteContext | undefined
    #ImportHook: ImportHook
    #AssignedImportMeta: object | null
    /** the global environment this module binds to */
    #GlobalThis: object = globalThis
    /** imported module cache */
    #ResolvedModules = new Map<string, PromiseCapability<Module>>()
    #ImportEntries: ModuleImportEntry[]
    #LocalExportEntries: ModuleExportEntry[]
    #IndirectExportEntries: ModuleExportEntry[]
    #StarExportEntries: ModuleExportEntry[]
    /** Where local export stored */
    #LocalExportValues = new Map<string, unknown>()
    /** Callback to update live exports */
    #ExportCallback = new Set<(name: string) => void>()
    //#endregion

    //#region VirtualModuleRecord methods
    //#endregion

    //#region ModuleRecord methods https://tc39.es/ecma262/#table-abstract-methods-of-module-records
    // https://tc39.es/ecma262/#sec-getexportednames
    #GetExportedNames(exportStarSet: Module[] = []): string[] {
        const module = this
        if (exportStarSet.includes(module)) return []
        exportStarSet.push(module)
        const exportedNames: string[] = []
        for (const e of module.#LocalExportEntries) {
            assert(e.ExportName !== null)
            exportedNames.push(e.ExportName)
        }
        for (const e of module.#IndirectExportEntries) {
            assert(e.ExportName !== null)
            exportedNames.push(e.ExportName)
        }
        for (const e of module.#StarExportEntries) {
            assert(e.ModuleRequest !== null)
            const requestedModule = Module.#HostResolveImportedModule(module, e.ModuleRequest)
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
        resolveSet: { module: Module; exportName: string }[] = [],
    ): typeof ambiguous | { module: Module; bindingName: string | typeof namespace } | null {
        const module = this
        for (const r of resolveSet) {
            if (module === r.module && exportName === r.exportName) {
                // Assert: This is a circular import request.
                return null
            }
        }
        resolveSet.push({ module, exportName })
        for (const e of module.#LocalExportEntries) {
            if (exportName === e.ExportName) {
                // assert(e.LocalName !== null)
                // return { module, bindingName: e.LocalName }
                return { module, bindingName: e.ExportName }
            }
        }
        for (const e of module.#IndirectExportEntries) {
            if (exportName === e.ExportName) {
                assert(e.ModuleRequest !== null)
                const importedModule = Module.#HostResolveImportedModule(module, e.ModuleRequest)
                if (e.ImportName === all) {
                    // Assert: module does not provide the direct binding for this export.
                    return { module: importedModule, bindingName: namespace }
                } else {
                    assert(typeof e.ImportName === 'string')
                    return importedModule.#ResolveExport(e.ImportName, resolveSet)
                }
            }
        }
        if (exportName === 'default') {
            // Assert: A default export was not explicitly provided by this module.
            // Note: A default export cannot be provided by an export * from "mod" declaration.
            return null
        }
        let starResolution: null | { module: Module; bindingName: string | typeof namespace } = null
        for (const e of module.#StarExportEntries) {
            assert(e.ModuleRequest !== null)
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
    #AsyncEvaluation = false
    #__AsyncEvaluationPreviouslyTrue = false
    #TopLevelCapability: PromiseCapability<void> | undefined
    #AsyncParentModules: Module[] = []
    #PendingAsyncDependencies: number | empty = empty
    //#endregion

    //#region CyclicModuleRecord methods https://tc39.es/ecma262/#table-cyclic-module-methods
    // https://tc39.es/ecma262/#sec-source-text-module-record-initialize-environment
    #InitializeEnvironment() {
        const module = this
        for (const e of module.#IndirectExportEntries) {
            assert(e.ExportName !== null)
            const resolution = module.#ResolveExport(e.ExportName)
            if (resolution === null || resolution === ambiguous) {
                throw new SyntaxError(`Module '${e.ModuleRequest}' does not provide an export ${e.ExportName}`)
            }
        }

        // Assert: All named exports from module are resolvable.

        const env = { __proto__: null }
        module.#ContextObject = createContextObject()
        module.#Environment = env

        for (const i of module.#ImportEntries) {
            const importedModule = Module.#HostResolveImportedModule(module, i.ModuleRequest)
            if (i.ImportName === namespace) {
                const namespaceObject = Module.#GetModuleNamespace(importedModule)
                Object.defineProperty(env, i.LocalName, { value: namespaceObject })
            } else {
                const resolution = importedModule.#ResolveExport(i.ImportName)
                if (resolution === null || resolution === ambiguous) {
                    throw new SyntaxError(`${i.ModuleRequest} does not provide export ${i.ImportName}`)
                }
                if (resolution.bindingName === namespace) {
                    const namespaceObject = Module.#GetModuleNamespace(resolution.module)
                    Object.defineProperty(env, i.LocalName, { value: namespaceObject })
                } else {
                    const { bindingName, module } = resolution
                    const f = () =>
                        Object.defineProperty(env, i.LocalName, {
                            value: module.#LocalExportValues.get(bindingName),
                            configurable: true,
                        })
                    resolution.module.#ExportCallback.add(f)

                    if (resolution.module.#LocalExportValues.has(bindingName)) {
                        f()
                    } else {
                        Object.defineProperty(env, i.LocalName, {
                            get() {
                                throw new ReferenceError(`Cannot access '${i.LocalName}' before initialization`)
                            },
                            configurable: true,
                        })
                    }
                }
            }
        }
        for (const { ModuleRequest, ExportName, ImportName } of module.#LocalExportEntries) {
            assert(ModuleRequest === null && typeof ExportName === 'string' && ImportName === null)
            Object.defineProperty(env, ExportName, {
                get: () => this.#LocalExportValues.get(ExportName),
                set: (value) => {
                    this.#LocalExportValues.set(ExportName, value)
                    this.#ExportCallback.forEach((f) => f(ExportName))
                    return true
                },
            })
        }

        for (const exports of module.#GetExportedNames()) {
            if (module.#ResolveExport(exports) === ambiguous) {
                throw new SyntaxError(`Module has multiple exports named '${exports}'`)
            }
        }
        // TODO: https://github.com/tc39/proposal-compartments/issues/70

        // prevent access to global env until [[ExecuteModule]]
        Object.setPrototypeOf(env, opaqueProxy)
    }
    #ExecuteModule(promise?: PromiseCapability<void>) {
        // prepare context
        this.#ContextObject!.globalThis = this.#GlobalThis as any
        if (this.#NeedsImportMeta) {
            this.#ContextObject!.importMeta = Object.assign({}, this.#AssignedImportMeta)
        }
        if (this.#NeedsImport) {
            this.#ContextObject!.import = async (specifier: string, options?: ImportCallOptions) => {
                const [module] = await Module.#HostResolveModules(this, [specifier])
                assert(module)
                return Module.#DynamicImportModule(module)
            }
        }

        assert(this.#Environment)
        const env = new Proxy(this.#Environment, moduleEnvExoticMethods)

        if (!this.#HasTLA) {
            assert(!promise)
            if (this.#Execute) {
                Reflect.apply(this.#Execute, this.#Source, [env, this.#ContextObject])
            }
        } else {
            assert(promise)
            if (this.#Execute) {
                Promise.resolve(Reflect.apply(this.#Execute, this.#Source, [env, this.#ContextObject])).then(
                    promise.Resolve,
                    promise.Reject,
                )
            }
        }
        this.#Execute = undefined!
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
        if (module.#TopLevelCapability) return module.#TopLevelCapability.Promise
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
            if (stack.includes(requiredModule)) {
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
            if (stack.includes(requiredModule)) {
                assert(requiredModule.#Status === ModuleStatus.evaluating)
            } else {
                assert(requiredModule.#Status !== ModuleStatus.evaluating)
            }
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
            if (requiredModule.#AsyncEvaluation === true) {
                module.#PendingAsyncDependencies++
                requiredModule.#AsyncParentModules.push(module)
            }
        }
        if (module.#PendingAsyncDependencies > 0 || module.#HasTLA) {
            assert(module.#AsyncEvaluation === false)
            assert(module.#__AsyncEvaluationPreviouslyTrue === false)
            module.#AsyncEvaluation = true
            module.#__AsyncEvaluationPreviouslyTrue = true
            // Note: The order in which module records have their [[AsyncEvaluation]] fields transition to true is significant. (See 16.2.1.5.2.4.)
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
                assert(m.#AsyncEvaluation === true)
                assert((m.#PendingAsyncDependencies as number) > 0)
                ;(m.#PendingAsyncDependencies as number)--
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
        assert(module.#AsyncEvaluation === true)
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
        assert(module.#AsyncEvaluation === true)
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
        const cache = module.#ResolvedModules.get(spec)
        assert(cache && cache.Status.Type !== 'Pending')
        if (cache.Status.Type === 'Rejected') throw cache.Status.Reason
        return cache.Status.Value
    }

    static #GetModuleNamespace(module: Module): ModuleNamespace {
        assert(module.#Status !== ModuleStatus.unlinked)
        if (module.#Namespace) return module.#Namespace
        const exportedNames = module.#GetExportedNames()
        const unambiguousNames = []
        for (const name of exportedNames) {
            const resolution = module.#ResolveExport(name)
            if (typeof resolution === 'object' && resolution !== null) {
                unambiguousNames.push(name)
            }
        }

        const namespace: ModuleNamespace = { __proto__: null }
        Object.defineProperty(namespace, Symbol.toStringTag, { value: 'Module' })
        for (const name of exportedNames) {
            if (module.#LocalExportValues.has(name)) {
                Object.defineProperty(namespace, name, {
                    enumerable: true,
                    writable: true,
                    value: module.#LocalExportValues.get(name),
                })
            } else {
                Object.defineProperty(namespace, name, {
                    get() {
                        throw new ReferenceError(`Cannot access '${name}' before initialization`)
                    },
                    // Note: this should not be configurable, but it's a trade-off for DX.
                    configurable: true,
                    enumerable: true,
                })
            }
        }
        module.#ExportCallback.add((name) => {
            Object.defineProperty(namespace, name, {
                enumerable: true,
                writable: true,
                value: module.#LocalExportValues.get(name),
            })
        })

        const proxy = new Proxy(namespace, moduleNamespaceExoticMethods)
        module.#Namespace = proxy
        return proxy
    }
    //#endregion

    //#region Our functions / host hooks
    static async #DynamicImportModule(module: Module) {
        if (module.#Status === ModuleStatus.evaluated) return this.#GetModuleNamespace(module)
        if (module.#Status === ModuleStatus.evaluatingAsync) {
            assert(module.#TopLevelCapability)
            await module.#TopLevelCapability.Promise
            return Module.#GetModuleNamespace(module)
        }

        await this.#HostResolveModules(module, module.#RequestedModules)
        module.#Link()
        await module.#Evaluate()
        return Module.#GetModuleNamespace(module)
    }
    static #HostResolveModulesInner(module: Module, spec: string) {
        const capability = PromiseCapability<Module>()
        module.#ResolvedModules.set(spec, capability)
        Promise.resolve(module.#ImportHook(spec, module.#Referral))
            .then(
                async (module) => {
                    if (module === null || module === undefined)
                        throw new SyntaxError(`Failed to resolve module '${spec}'`)
                    // Safari: private in
                    module.#HasTLA
                    // if (!(#HasTLA in module)) throw new TypeError('ImportHook must return a Module instance')
                    await this.#HostResolveModules(module, module.#RequestedModules)
                    return module
                },
                (error) => {
                    throw new SyntaxError(`Failed to import module '${spec}'`, { cause: error })
                },
            )
            .then(capability.Resolve, capability.Reject)
        return capability.Promise
    }
    // call importHook recursively to get all module referenced.
    static async #HostResolveModules(module: Module, requestModules: string[]) {
        const promises = requestModules.map(async (spec) => {
            const cache = module.#ResolvedModules.get(spec)
            if (!cache) {
                return this.#HostResolveModulesInner(module, spec)
            } else if (cache.Status.Type === 'Pending') {
                return cache.Status.Promise
            } else if (cache.Status.Type === 'Fulfilled') {
                return cache.Status.Value
            } else {
                throw cache.Status.Reason
            }
        })
        return Promise.all(promises)
    }
    //#endregion
    /** @internal */
    static {
        imports = async (module, options) => {
            return Module.#DynamicImportModule(module) as any
        }
        setGlobalThis = (module, global) => (module.#GlobalThis = global)
    }
}
Reflect.defineProperty(Module.prototype, Symbol.toStringTag, {
    configurable: true,
    value: 'Module',
})

const enum ModuleStatus {
    unlinked,
    linking,
    linked,
    evaluating,
    evaluatingAsync,
    evaluated,
}

function createContextObject() {
    const context: VirtualModuleRecordExecuteContext = {} as any
    Object.defineProperties(context, {
        import: { writable: true, enumerable: true, value: undefined },
        importMeta: { writable: true, enumerable: true, value: undefined },
        globalThis: { writable: true, enumerable: true, value: undefined },
    })
    return context
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
        if (attributes.get || attributes.set) return false
        if (attributes.writable === false) return false
        if ('value' in attributes) return Object.is(current.value, attributes.value)
        return true
    },
    set() {
        return false
    },
    preventExtensions() {
        return true
    },
    isExtensible() {
        return false
    },
}

const moduleEnvExoticMethods: ProxyHandler<any> = {
    getOwnPropertyDescriptor: () => undefined,
    defineProperty() {
        // TODO:
        internalError()
    },
    deleteProperty() {
        return false
    },
    has() {
        return false
    },
    ownKeys() {
        return []
    },
    isExtensible: () => false,
    preventExtensions: () => true,
    getPrototypeOf: () => null,
    setPrototypeOf: (_, v) => v === null,
}
