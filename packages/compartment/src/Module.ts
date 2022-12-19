import { ModuleSource } from './ModuleSource.js'
import type {
    ImportHook,
    ImportMetaHook,
    ModuleHandler,
    ModuleNamespace,
    VirtualModuleRecord,
    VirtualModuleRecordExecuteContext,
} from './types.js'
import {
    all,
    ambiguous,
    empty,
    namespace,
    NormalCompletion,
    PromiseCapability,
    ThrowCompletion,
    type Completion,
    type ModuleExportEntry,
    type ModuleImportEntry,
} from './utils/spec.js'
import { normalizeBindingsToSpecRecord, normalizeVirtualModuleRecord } from './utils/normalize.js'
import { assertFailed, opaqueProxy } from './utils/assert.js'
import { defaultImportHook } from './Evaluators.js'
import { createTask, type Task } from './utils/async-task.js'

export let imports: <T extends ModuleNamespace = any>(specifier: Module<T>, options?: ImportCallOptions) => Promise<T>
/** @internal */
export let setParentGlobalThis: (module: Module, global: object) => void
/** @internal */
export let setParentImportHook: (module: Module, handler: ImportHook) => void
/** @internal */
export let setParentImportMetaHook: (module: Module, handler: ImportMetaHook) => void

export class Module<T extends ModuleNamespace = any> {
    /**
     * https://tc39.es/proposal-compartments/0-module-and-module-source.html#sec-module
     */
    constructor(moduleSource: ModuleSource<T> | VirtualModuleRecord, handler: ModuleHandler) {
        // Note: we act as CSP enabled, therefore no ModuleSource instance can be created.
        if (typeof moduleSource !== 'object') throw new TypeError('moduleSource must be an object')
        if (moduleSource instanceof ModuleSource) assertFailed('ModuleSource instance cannot be created')
        // At this point, the only possible & valid module source is a VirtualModuleRecord.
        const module = normalizeVirtualModuleRecord(moduleSource)

        let importHook: ImportHook | undefined
        let importMetaHook: ImportMetaHook | undefined
        if (typeof handler === 'object' && handler) {
            importHook = handler.importHook
            if (typeof importHook !== 'function' && importHook !== undefined)
                throw new TypeError('importHook must be a function')
            importMetaHook = handler.importMetaHook
            if (typeof importMetaHook !== 'function' && importMetaHook !== undefined)
                throw new TypeError('importMetaHook must be a function')
        } else if (handler === undefined) {
            importHook = undefined
            importMetaHook = undefined
        } else throw new TypeError('handler must be an object or undefined')

        this.#Layer2_VirtualModuleSource = moduleSource
        this.#Layer2_Execute = module.execute
        this.#Layer2_NeedsImport = module.needsImport
        this.#Layer2_NeedsImportMeta = module.needsImportMeta
        this.#HasTLA = !!module.isAsync

        this.#Layer0_ImportHook = importHook
        this.#Layer0_ImportMetaHook = importMetaHook
        this.#Layer0_HandlerValue = handler

        const { importEntries, indirectExportEntries, localExportEntries, requestedModules, starExportEntries } =
            normalizeBindingsToSpecRecord(module.bindings)
        this.#ImportEntries = importEntries
        this.#IndirectExportEntries = indirectExportEntries
        this.#LocalExportEntries = localExportEntries
        this.#RequestedModules = requestedModules
        this.#StarExportEntries = starExportEntries
    }
    /**
     * https://tc39.es/proposal-compartments/0-module-and-module-source.html#sec-module.prototype.source
     */
    get source(): ModuleSource | VirtualModuleRecord | null {
        return this.#Layer2_VirtualModuleSource as VirtualModuleRecord
    }
    //#region ModuleRecord
    /**
     * The Environment Record containing the top level bindings for this module.
     * This field is set when the module is linked.
     * https://tc39.es/ecma262/#table-module-record-fields
     */
    #Environment: object | undefined
    /**
     * The Module Namespace Object (28.3) if one has been created for this module.
     * https://tc39.es/ecma262/#table-module-record-fields
     */
    #Namespace: ModuleNamespace | undefined
    //#endregion
    //#region CyclicModuleRecord
    /**
     * Initially new. Transitions to unlinked, linking, linked, evaluating, possibly evaluating-async, evaluated (in that order) as the module progresses throughout its lifecycle. evaluating-async indicates this module is queued to execute on completion of its asynchronous dependencies or it is a module whose [[HasTLA]] field is true that has been executed and is pending top-level completion.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #Status = ModuleStatus.new
    /**
     * A throw completion representing the exception that occurred during evaluation. undefined if no exception occurred or if [[Status]] is not evaluated.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #EvaluationError: unknown | empty = empty
    /**
     * Auxiliary field used during Link and Evaluate only. If [[Status]] is linking or evaluating, this non-negative number records the point at which the module was first visited during the depth-first traversal of the dependency graph.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #DFSIndex: number | empty = empty
    /**
     * Auxiliary field used during Link and Evaluate only. If [[Status]] is linking or evaluating, this is either the module's own [[DFSIndex]] or that of an "earlier" module in the same strongly connected component.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #DFSAncestorIndex: number | empty = empty
    /**
     * A List of all the ModuleSpecifier strings used by the module represented by this record to request the importation of a module. The List is in source text occurrence order.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #RequestedModules: string[]
    /**
     * A map from the specifier strings used by the module represented by this record to request the importation of a module to the resolved Module Record. The list does not contain two different Records with the same [[Specifier]].
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #LoadedModules = new Map<string, Module>()
    /**
     * The first visited module of the cycle, the root DFS ancestor of the strongly connected component. For a module not in a cycle this would be the module itself. Once Evaluate has completed, a module's [[DFSAncestorIndex]] is equal to the [[DFSIndex]] of its [[CycleRoot]].
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #CycleRoot: Module | undefined
    /**
     * Whether this module is individually asynchronous (for example, if it's a Source Text Module Record containing a top-level await). Having an asynchronous dependency does not mean this field is true. This field must not change after the module is parsed.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #HasTLA: boolean
    /**
     * Whether this module is either itself asynchronous or has an asynchronous dependency. Note: The order in which this field is set is used to order queued executions, see 16.2.1.5.3.4.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #AsyncEvaluation = false
    /**
     * If this module is the [[CycleRoot]] of some cycle, and Evaluate() was called on some module in that cycle, this field contains the PromiseCapability Record for that entire evaluation. It is used to settle the Promise object that is returned from the Evaluate() abstract method. This field will be empty for any dependencies of that module, unless a top-level Evaluate() has been initiated for some of those dependencies.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #TopLevelCapability: PromiseCapability<void> | undefined
    /**
     * If this module or a dependency has [[HasTLA]] true, and execution is in progress, this tracks the parent importers of this module for the top-level execution job. These parent modules will not start executing before this module has successfully completed execution.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #AsyncParentModules: Module[] = []
    /**
     * If this module has any asynchronous dependencies, this tracks the number of asynchronous dependency modules remaining to execute for this module. A module with asynchronous dependencies will be executed when this field reaches 0 and there are no execution errors.
     * https://tc39.es/ecma262/#sec-cyclic-module-records
     */
    #PendingAsyncDependencies: number | empty = empty
    /** https://tc39.es/ecma262/#sec-LoadRequestedModules */
    #LoadRequestedModules(HostDefined: Task) {
        const module = this
        const pc = PromiseCapability<void>()
        const state: GraphLoadingState = {
            IsLoading: true,
            PendingModulesCount: 1,
            Visited: [],
            PromiseCapability: pc,
            HostDefined,
        }
        Module.#InnerModuleLoading(state, module)
        return pc.Promise
    }
    /** https://tc39.es/ecma262/#sec-InnerModuleLoading */
    static #InnerModuleLoading(state: GraphLoadingState, module: Module) {
        if (!state.IsLoading) assertFailed()
        if (module.#Status === ModuleStatus.new && !state.Visited.includes(module)) {
            state.Visited.push(module)
            const requestedModulesCount = module.#RequestedModules.length
            state.PendingModulesCount = state.PendingModulesCount + requestedModulesCount
            for (const required of module.#RequestedModules) {
                // i. If module.[[LoadedModules]] contains a Record whose [[Specifier]] is required, then
                // 1. Let record be that Record.
                const record = module.#LoadedModules.get(required)
                if (record) {
                    Module.#InnerModuleLoading(state, record)
                } else {
                    Module.#Layer0_LoadImportedModule(module, required, state.HostDefined, state)
                    // 2. NOTE: HostLoadImportedModule will call FinishLoadingImportedModule, which re-enters the graph loading process through ContinueModuleLoading.
                }
                if (!state.IsLoading) return
            }
        }
        if (!(state.PendingModulesCount >= 1)) assertFailed()
        state.PendingModulesCount = state.PendingModulesCount - 1
        if (state.PendingModulesCount === 0) {
            state.IsLoading = false
            for (const loaded of state.Visited) {
                if (loaded.#Status === ModuleStatus.new) loaded.#Status = ModuleStatus.unlinked
            }
            state.PromiseCapability.Resolve()
        }
    }
    /** https://tc39.es/ecma262/#sec-ContinueModuleLoading */
    static #ContinueModuleLoading(state: GraphLoadingState, moduleCompletion: Completion<Module>) {
        if (!state.IsLoading) return
        if (moduleCompletion.Type === 'normal') Module.#InnerModuleLoading(state, moduleCompletion.Value)
        else {
            state.IsLoading = false
            state.PromiseCapability.Reject(moduleCompletion.Value)
        }
    }
    /** https://tc39.es/ecma262/#sec-moduledeclarationlinking */
    #Link() {
        const module = this
        if (
            ![
                ModuleStatus.unlinked,
                ModuleStatus.linked,
                ModuleStatus.evaluatingAsync,
                ModuleStatus.evaluated,
            ].includes(module.#Status)
        )
            assertFailed()
        const stack: Module[] = []
        try {
            Module.#InnerModuleLinking(module, stack, 0)
        } catch (err) {
            for (const mod of stack) {
                if (!(mod.#Status === ModuleStatus.linking)) assertFailed()
                mod.#Status = ModuleStatus.unlinked
            }
            if (!(module.#Status === ModuleStatus.unlinked)) assertFailed()
            throw err
        }
        if (![ModuleStatus.linked, ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status))
            assertFailed()
        if (!(stack.length === 0)) assertFailed()
    }
    /** https://tc39.es/ecma262/#sec-InnerModuleLinking */
    static #InnerModuleLinking(module: Module, stack: Module[], index: number) {
        if (
            [ModuleStatus.linking, ModuleStatus.linked, ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(
                module.#Status,
            )
        ) {
            return index
        }
        if (!(module.#Status === ModuleStatus.unlinked)) assertFailed()
        module.#Status = ModuleStatus.linking
        module.#DFSIndex = index
        module.#DFSAncestorIndex = index
        index++
        stack.push(module)
        for (const required of module.#RequestedModules) {
            const requiredModule = this.#GetImportedModule(module, required)
            index = this.#InnerModuleLinking(requiredModule, stack, index)
            if (
                ![
                    ModuleStatus.linking,
                    ModuleStatus.linked,
                    ModuleStatus.evaluatingAsync,
                    ModuleStatus.evaluated,
                ].includes(requiredModule.#Status)
            )
                assertFailed()
            if (stack.includes(requiredModule)) {
                if (!(requiredModule.#Status === ModuleStatus.linking)) assertFailed()
            } else {
                if (!(requiredModule.#Status !== ModuleStatus.linking)) assertFailed()
            }
            if (requiredModule.#Status === ModuleStatus.linking) {
                module.#DFSAncestorIndex = Math.min(
                    module.#DFSAncestorIndex,
                    requiredModule.#DFSAncestorIndex as number,
                )
            }
        }
        module.#InitializeEnvironment()
        if (!(stack.filter((x) => x === module).length === 1)) assertFailed()
        if (!(module.#DFSAncestorIndex <= module.#DFSIndex)) assertFailed()
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
    /** https://tc39.es/ecma262/#sec-moduleevaluation */
    #Evaluate(HostDefined: Task) {
        let module: Module = this
        // TODO: Assert: This call to Evaluate is not happening at the same time as another call to Evaluate within the surrounding agent.
        if (![ModuleStatus.linked, ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status))
            assertFailed()
        if ([ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status)) {
            module = module.#CycleRoot!
            if (!module) assertFailed() // TODO: https://github.com/tc39/ecma262/issues/2823
        }
        if (module.#TopLevelCapability) return module.#TopLevelCapability.Promise
        const stack: Module[] = []
        const capability = PromiseCapability<void>()
        module.#TopLevelCapability = capability
        try {
            Module.#InnerModuleEvaluation(module, stack, 0, HostDefined)
        } catch (err) {
            for (const m of stack) {
                if (!(m.#Status === ModuleStatus.evaluating)) assertFailed()
                m.#Status = ModuleStatus.evaluated
                m.#EvaluationError = err
            }
            if (!(module.#Status === ModuleStatus.evaluated)) assertFailed()
            if (!(module.#EvaluationError === err)) assertFailed()
            capability.Reject(err)
            return capability.Promise
        }
        if (![ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status)) assertFailed()
        if (!(module.#EvaluationError === empty)) assertFailed()
        if (module.#AsyncEvaluation === false) {
            if (!(module.#Status === ModuleStatus.evaluated)) assertFailed()
            capability.Resolve()
        }
        if (!(stack.length === 0)) assertFailed()
        return capability.Promise
    }
    /** https://tc39.es/ecma262/#sec-InnerModuleEvaluation */
    static #InnerModuleEvaluation(module: Module, stack: Module[], index: number, HostDefined: Task) {
        if ([ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(module.#Status)) {
            if (module.#EvaluationError === empty) return index
            throw module.#EvaluationError
        }
        if (module.#Status === ModuleStatus.evaluating) return index
        if (!(module.#Status === ModuleStatus.linked)) assertFailed()
        module.#Status = ModuleStatus.evaluating
        module.#DFSIndex = index
        module.#DFSAncestorIndex = index
        module.#PendingAsyncDependencies = 0
        index++
        stack.push(module)
        for (const required of module.#RequestedModules) {
            let requiredModule = Module.#GetImportedModule(module, required)
            index = Module.#InnerModuleEvaluation(requiredModule, stack, index, HostDefined)
            if (
                ![ModuleStatus.evaluating, ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(
                    requiredModule.#Status,
                )
            )
                assertFailed()
            if (stack.includes(requiredModule)) {
                if (!(requiredModule.#Status === ModuleStatus.evaluating)) assertFailed()
            } else {
                if (!(requiredModule.#Status !== ModuleStatus.evaluating)) assertFailed()
            }
            if (requiredModule.#Status === ModuleStatus.evaluating) {
                module.#DFSAncestorIndex = Math.min(
                    module.#DFSAncestorIndex,
                    requiredModule.#DFSAncestorIndex as number,
                )
            } else {
                requiredModule = requiredModule.#CycleRoot!
                if (![ModuleStatus.evaluatingAsync, ModuleStatus.evaluated].includes(requiredModule.#Status))
                    assertFailed()
                if (requiredModule.#EvaluationError !== empty) throw requiredModule.#EvaluationError
            }
            if (requiredModule.#AsyncEvaluation === true) {
                module.#PendingAsyncDependencies++
                requiredModule.#AsyncParentModules.push(module)
            }
        }
        if (module.#PendingAsyncDependencies > 0 || module.#HasTLA) {
            if (!(module.#AsyncEvaluation === false)) assertFailed()
            if (!(module.#NON_SPEC_AsyncEvaluationPreviouslyTrue === false)) assertFailed()
            module.#AsyncEvaluation = true
            module.#NON_SPEC_AsyncEvaluationPreviouslyTrue = true
            // Note: The order in which module records have their [[AsyncEvaluation]] fields transition to true is significant. (See 16.2.1.5.2.4.)
            if (module.#PendingAsyncDependencies === 0) {
                Module.#ExecuteAsyncModule(module, HostDefined)
            }
        } else {
            HostDefined.run(() => module.#Layer2_ExecuteModule())
        }
        if (!(stack.filter((x) => x === module).length === 1)) assertFailed()
        if (!(module.#DFSAncestorIndex <= module.#DFSIndex)) assertFailed()
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
    /** https://tc39.es/ecma262/#sec-execute-async-module */
    static #ExecuteAsyncModule(module: Module, HostDefined: Task) {
        if (![ModuleStatus.evaluating, ModuleStatus.evaluatingAsync].includes(module.#Status)) assertFailed()
        if (!module.#HasTLA) assertFailed()
        const capability = PromiseCapability<void>()
        capability.Promise.then(
            () => {
                this.#AsyncModuleExecutionFulfilled(module, HostDefined)
            },
            (error) => {
                this.#AsyncModuleExecutionRejected(module, error)
            },
        )
        HostDefined.run(() => module.#Layer2_ExecuteModule(capability))
    }
    /** https://tc39.es/ecma262/#sec-gather-available-ancestors */
    static #GatherAvailableAncestors(module: Module, execList: Module[]) {
        for (const m of module.#AsyncParentModules) {
            if (!execList.includes(m) && m.#CycleRoot!.#EvaluationError === empty) {
                if (!(m.#Status === ModuleStatus.evaluatingAsync)) assertFailed()
                if (!(m.#EvaluationError === empty)) assertFailed()
                if (!(m.#AsyncEvaluation === true)) assertFailed()
                if (!((m.#PendingAsyncDependencies as number) > 0)) assertFailed()
                ;(m.#PendingAsyncDependencies as number)--
                if (m.#PendingAsyncDependencies === 0) {
                    execList.push(m)
                    if (!m.#HasTLA) Module.#GatherAvailableAncestors(m, execList)
                }
            }
        }
    }
    /** https://tc39.es/ecma262/#sec-async-module-execution-fulfilled */
    static #AsyncModuleExecutionFulfilled(module: Module, HostDefined: Task) {
        if (module.#Status === ModuleStatus.evaluated) {
            if (!(module.#EvaluationError !== empty)) assertFailed()
            return
        }
        if (!(module.#Status === ModuleStatus.evaluatingAsync)) assertFailed()
        if (!(module.#AsyncEvaluation === true)) assertFailed()
        if (!(module.#EvaluationError === empty)) assertFailed()
        module.#AsyncEvaluation = false
        module.#Status = ModuleStatus.evaluated
        if (module.#TopLevelCapability) {
            if (!(module.#CycleRoot === module)) assertFailed()
            module.#TopLevelCapability.Resolve()
        }
        const execList: Module[] = []
        Module.#GatherAvailableAncestors(module, execList)
        // TODO: Let sortedExecList be a List whose elements are the elements of execList, in the order in which they had their [[AsyncEvaluation]] fields set to true in InnerModuleEvaluation.
        const sortedExecList = execList
        if (
            !sortedExecList.every(
                (x) => x.#AsyncEvaluation && x.#PendingAsyncDependencies === 0 && x.#EvaluationError === empty,
            )
        )
            assertFailed()
        for (const m of sortedExecList) {
            if (m.#Status === ModuleStatus.evaluated) {
                if (!(m.#EvaluationError !== empty)) assertFailed()
            } else if (m.#HasTLA) {
                Module.#ExecuteAsyncModule(m, HostDefined)
            } else {
                try {
                    HostDefined.run(() => m.#Layer2_ExecuteModule())
                } catch (err) {
                    this.#AsyncModuleExecutionRejected(m, err)
                    continue
                }
                m.#Status = ModuleStatus.evaluated
                if (m.#TopLevelCapability) {
                    if (!(m.#CycleRoot === m)) assertFailed()
                    m.#TopLevelCapability.Resolve()
                }
            }
        }
    }
    /** https://tc39.es/ecma262/#sec-async-module-execution-rejected */
    static #AsyncModuleExecutionRejected = (module: Module, error: unknown) => {
        if (module.#Status === ModuleStatus.evaluated) {
            if (!(module.#EvaluationError !== empty)) assertFailed()
            return
        }
        if (!(module.#Status === ModuleStatus.evaluatingAsync)) assertFailed()
        if (!(module.#AsyncEvaluation === true)) assertFailed()
        if (!(module.#EvaluationError === empty)) assertFailed()
        module.#EvaluationError = error
        module.#Status = ModuleStatus.evaluated
        for (const m of module.#AsyncParentModules) {
            this.#AsyncModuleExecutionRejected(m, error)
        }
        if (module.#TopLevelCapability) {
            if (!(module.#CycleRoot === module)) assertFailed()
            module.#TopLevelCapability.Reject(error)
        }
    }
    //#endregion
    //#region SourceTextModuleRecord
    /**
     * A List of ImportEntry records derived from the code of this module.
     * https://tc39.es/ecma262/#table-additional-fields-of-source-text-module-records
     */
    #ImportEntries: ModuleImportEntry[]
    /**
     * A List of ExportEntry records derived from the code of this module that correspond to declarations that occur within the module.
     * https://tc39.es/ecma262/#table-additional-fields-of-source-text-module-records
     */
    #LocalExportEntries: ModuleExportEntry[]
    /**
     * A List of ExportEntry records derived from the code of this module that correspond to reexported imports that occur within the module or exports from export * as namespace declarations.
     * https://tc39.es/ecma262/#table-additional-fields-of-source-text-module-records
     */
    #IndirectExportEntries: ModuleExportEntry[]
    /**
     * A List of ExportEntry records derived from the code of this module that correspond to export * declarations that occur within the module, not including export * as namespace declarations.
     * https://tc39.es/ecma262/#table-additional-fields-of-source-text-module-records
     */
    #StarExportEntries: ModuleExportEntry[]
    /** https://tc39.es/ecma262/#sec-getexportednames */
    #GetExportedNames(exportStarSet: Module[] = []): string[] {
        const module = this
        if (!(module.#Status !== ModuleStatus.new)) assertFailed()
        if (exportStarSet.includes(module)) {
            // a. Assert: We've reached the starting point of an export * circularity.
            return []
        }
        exportStarSet.push(module)
        const exportedNames: string[] = []
        for (const e of module.#LocalExportEntries) {
            // a. Assert: module provides the direct binding for this export.
            if (!(e.ExportName !== null)) assertFailed()
            exportedNames.push(e.ExportName)
        }
        for (const e of module.#IndirectExportEntries) {
            // a. Assert: module imports a specific binding for this export.
            if (!(e.ExportName !== null)) assertFailed()
            exportedNames.push(e.ExportName)
        }
        for (const e of module.#StarExportEntries) {
            // this assert does not appear in the spec.
            if (!(e.ModuleRequest !== null)) assertFailed()
            const requestedModule = Module.#GetImportedModule(module, e.ModuleRequest)
            const starNames = requestedModule.#GetExportedNames(exportStarSet)
            for (const n of starNames) {
                if (n === 'default') continue
                if (exportedNames.includes(n)) continue
                exportedNames.push(n)
            }
        }
        return exportedNames
    }
    /** https://tc39.es/ecma262/#sec-resolveexport */
    #ResolveExport(
        exportName: string,
        resolveSet: { Module: Module; ExportName: string }[] = [],
    ): typeof ambiguous | ResolvedBindingRecord | null {
        const module = this
        if (!(module.#Status !== ModuleStatus.new)) assertFailed()
        for (const r of resolveSet) {
            if (module === r.Module && exportName === r.ExportName) {
                // Assert: This is a circular import request.
                return null
            }
        }
        resolveSet.push({ Module: module, ExportName: exportName })
        for (const e of module.#LocalExportEntries) {
            if (exportName === e.ExportName) {
                // i. Assert: module provides the direct binding for this export.
                // if (!(e.LocalName !== null)) assertFailed()
                // return { module, bindingName: e.LocalName }

                // ? why we use this alternative step?
                return { Module: module, BindingName: e.ExportName }
            }
        }
        for (const e of module.#IndirectExportEntries) {
            if (exportName === e.ExportName) {
                // this assert does not appear in the spec.
                if (!(e.ModuleRequest !== null)) assertFailed()
                const importedModule = Module.#GetImportedModule(module, e.ModuleRequest)
                if (e.ImportName === all) {
                    // Assert: module does not provide the direct binding for this export.
                    return { Module: importedModule, BindingName: namespace }
                } else {
                    // 1. Assert: module imports a specific binding for this export.
                    if (!(typeof e.ImportName === 'string')) assertFailed()
                    return importedModule.#ResolveExport(e.ImportName, resolveSet)
                }
            }
        }
        if (exportName === 'default') {
            // Assert: A default export was not explicitly provided by this module.
            // Note: A default export cannot be provided by an export * from "mod" declaration.
            return null
        }
        let starResolution: null | ResolvedBindingRecord = null
        for (const e of module.#StarExportEntries) {
            // this assert does not appear in the spec.
            if (!(e.ModuleRequest !== null)) assertFailed()
            const importedModule = Module.#GetImportedModule(module, e.ModuleRequest)
            let resolution = importedModule.#ResolveExport(exportName, resolveSet)
            if (resolution === ambiguous) return ambiguous
            if (resolution !== null) {
                // i. Assert: resolution is a ResolvedBinding Record.
                if (starResolution === null) starResolution = resolution
                else {
                    // Assert: There is more than one * import that includes the requested name.
                    if (resolution.Module !== starResolution.Module) return ambiguous
                    if (
                        (resolution.BindingName === namespace && starResolution.BindingName !== namespace) ||
                        (resolution.BindingName !== namespace && starResolution.BindingName === namespace)
                    )
                        return ambiguous
                    if (
                        typeof resolution.BindingName === 'string' &&
                        typeof starResolution.BindingName === 'string' &&
                        resolution.BindingName !== starResolution.BindingName
                    ) {
                        return ambiguous
                    }
                }
            }
        }
        return starResolution
    }
    /** https://tc39.es/ecma262/#sec-source-text-module-record-initialize-environment */
    #InitializeEnvironment() {
        const module = this
        for (const e of module.#IndirectExportEntries) {
            // this assert does not appear in the spec.
            if (!(e.ExportName !== null)) assertFailed()
            const resolution = module.#ResolveExport(e.ExportName)
            if (resolution === null || resolution === ambiguous) {
                throw new SyntaxError(`Module '${e.ModuleRequest}' does not provide an export ${e.ExportName}`)
            }
        }

        // 2. Assert: All named exports from module are resolvable.

        // 5. Let env be NewModuleEnvironment(realm.[[GlobalEnv]]).
        const env = { __proto__: null }
        // 6. Set module.[[Environment]] to env.
        module.#Environment = env
        module.#Layer2_ContextObject = createContextObject()

        const envBindings: PropertyDescriptorMap = {
            __proto__: null!,
        }
        // 7. For each ImportEntry Record in of module.[[ImportEntries]], do
        for (const i of module.#ImportEntries) {
            const importedModule = Module.#GetImportedModule(module, i.ModuleRequest)
            // import * as ns from '..'
            if (i.ImportName === namespace) {
                const namespaceObject = Module.#GetModuleNamespace(importedModule)
                envBindings[i.LocalName] = { value: namespaceObject, enumerable: true }
            } else {
                const resolution = importedModule.#ResolveExport(i.ImportName)
                if (resolution === null)
                    throw new SyntaxError(`${i.ModuleRequest} does not provide export ${i.ImportName}`)
                if (resolution === ambiguous)
                    throw new SyntaxError(`${i.ModuleRequest} does not provide an unambiguous export ${i.ImportName}`)
                // import { x } from '...' where x is a "export * as ns from '...'"
                if (resolution.BindingName === namespace) {
                    const namespaceObject = Module.#GetModuleNamespace(resolution.Module)
                    envBindings[i.LocalName] = { value: namespaceObject, enumerable: true }
                } else {
                    // 1. Perform env.CreateImportBinding(in.[[LocalName]], resolution.[[Module]], resolution.[[BindingName]]).
                    resolution.Module.#NON_SPEC_AddLiveExportCallback(i.ImportName, (newValue) => {
                        Object.defineProperty(env, i.LocalName, {
                            value: newValue,
                            configurable: true,
                            enumerable: true,
                        })
                    })

                    if (resolution.Module.#NON_SPEC_LocalExportedValues.has(resolution.BindingName)) {
                        envBindings[i.LocalName] = {
                            configurable: true,
                            enumerable: true,
                            value: resolution.Module.#NON_SPEC_LocalExportedValues.get(resolution.BindingName),
                        }
                    } else {
                        envBindings[i.LocalName] = {
                            get() {
                                throw new ReferenceError(`Cannot access '${i.LocalName}' before initialization`)
                            },
                            configurable: true,
                            enumerable: true,
                        }
                    }
                }
            }
        }

        // non-spec: set up env for exported bindings
        for (const { ModuleRequest, ExportName, ImportName } of module.#LocalExportEntries) {
            if (!(ModuleRequest === null && typeof ExportName === 'string' && ImportName === null)) assertFailed()
            envBindings[ExportName] = {
                get: () => this.#NON_SPEC_LocalExportedValues.get(ExportName),
                set: (value) => {
                    this.#NON_SPEC_LocalExportedValues.set(ExportName, value)
                    this.#NON_SPEC_ExportCallback.get(ExportName)?.forEach((callback) => callback(value))
                    return true
                },
                // Note: export property should not be enumerable?
                // but it will crash Chrome devtools. See: https://bugs.chromium.org/p/chromium/issues/detail?id=1358114
                enumerable: true,
            }
        }
        Object.defineProperties(env, envBindings)

        // ? no spec reference?
        for (const exports of module.#GetExportedNames()) {
            if (module.#ResolveExport(exports) === ambiguous) {
                throw new SyntaxError(`Module has multiple exports named '${exports}'`)
            }
        }
        // TODO: https://github.com/tc39/proposal-compartments/issues/70
        // prevent access to global env until [[ExecuteModule]]
        Object.setPrototypeOf(env, opaqueProxy)
    }
    //#endregion
    //#region Non-spec things (needed for this impl)
    /**
     * This is used as an assertion in the spec but spec does not contain it.
     */
    #NON_SPEC_AsyncEvaluationPreviouslyTrue = false
    /**
     * A map that map the exported name to it's current value.
     */
    #NON_SPEC_LocalExportedValues = new Map<string, unknown>()
    /**
     * A callback map that stores all listeners will be notified when the requested export name has been updated.
     */
    #NON_SPEC_ExportCallback = new Map<string, Set<(newValue: any) => void>>()
    #NON_SPEC_AddLiveExportCallback(name: string, callback: (newValue: any) => void) {
        if (!this.#NON_SPEC_ExportCallback.has(name)) this.#NON_SPEC_ExportCallback.set(name, new Set())
        this.#NON_SPEC_ExportCallback.get(name)!.add(callback)
    }
    //#endregion
    //#region Layer 0 features
    /**
     * Defaults to undefined. The function can return a module instance to resolve module dependencies.
     * https://tc39.es/proposal-compartments/0-module-and-module-source.html#table-internal-slots-of-module-instances
     */
    #Layer0_ImportHook: ImportHook | undefined
    /**
     * Defaults to undefined. The function can augment the import.meta object provided as the first argument.
     * https://tc39.es/proposal-compartments/0-module-and-module-source.html#table-internal-slots-of-module-instances
     */
    #Layer0_ImportMetaHook: ImportMetaHook | undefined
    /**
     * This is the *this* value used for invocation of the hook functions.
     * https://tc39.es/proposal-compartments/0-module-and-module-source.html#table-internal-slots-of-module-instances
     */
    #Layer0_HandlerValue: ModuleHandler

    /**
     * A map from the specifier strings imported by this module to the states of the loading processes that are waiting for the resolved module record. It is used to avoid multiple calls to the loading hook with the same (specifier, referrer) pair. The list does not contain two different Records with the same [[Specifier]].
     * https://tc39.es/proposal-compartments/0-module-and-module-source.html#table-cyclic-module-fields
     */
    #Layer0_LoadingModules = new Map<string, Set<GraphLoadingState | PromiseCapability<ModuleNamespace>>>()
    /** https://tc39.es/proposal-compartments/0-module-and-module-source.html#sec-LoadImportedModule */
    static #Layer0_LoadImportedModule(
        referrer: Module,
        specifier: string,
        hostDefined: Task,
        state: GraphLoadingState | PromiseCapability<ModuleNamespace>,
    ) {
        if (referrer.#LoadedModules.has(specifier)) {
            const module = referrer.#LoadedModules.get(specifier)!
            this.#Layer0_FinishLoadingImportedModule(referrer, specifier, NormalCompletion(module), hostDefined)
            return
        }
        if (referrer.#Layer0_LoadingModules.has(specifier)) {
            referrer.#Layer0_LoadingModules.get(specifier)!.add(state)
            return
        }
        referrer.#Layer0_LoadingModules.set(specifier, new Set([state]))
        // Skipped spec:
        // 4. If referrer is not a Source Text Module Record, referrer.[[ModuleInstance]] is undefined, or referrer.[[ModuleInstance]].[[ImportHook]] is undefined, then
        //     a. Perform HostLoadImportedModule(referrer, specifier, hostDefined).
        //     b. Return unused.
        // Reason: we cannot call HostLoadImportedModule and we always have a importHook.
        try {
            const importHookResult = referrer.#Layer0_ImportHook
                ? Reflect.apply(referrer.#Layer0_ImportHook, referrer.#Layer0_HandlerValue, [specifier])
                : Reflect.apply(referrer.#Layer3_ParentImportHook, undefined, [specifier])
            // unwrap importHookResult here
            const importHookPromise = Promise.resolve(importHookResult)
            // unwrap PromiseResolve(%Promise%, importHookResult.[[Value]]) here
            const onFulfilled = (result: any) => {
                let completion: Completion<Module>
                try {
                    ;(result as Module).#Layer0_HandlerValue
                    completion = NormalCompletion(result)
                } catch (error) {
                    completion = ThrowCompletion(new TypeError('importHook must return a Module instance'))
                }
                Module.#Layer0_FinishLoadingImportedModule(referrer, specifier, completion, hostDefined)
            }
            const onRejected = (error: any) => {
                this.#Layer0_FinishLoadingImportedModule(referrer, specifier, ThrowCompletion(error), hostDefined)
            }
            importHookPromise.then(onFulfilled, onRejected)
        } catch (error) {
            this.#Layer0_FinishLoadingImportedModule(referrer, specifier, ThrowCompletion(error), hostDefined)
        }
    }
    /**
     * https://tc39.es/ecma262/#sec-FinishLoadingImportedModule
     * https://tc39.es/proposal-compartments/0-module-and-module-source.html#sec-FinishLoadingImportedModule
     */
    static #Layer0_FinishLoadingImportedModule(
        referrer: Module,
        specifier: string,
        result: Completion<Module>,
        hostDefined: Task,
    ) {
        if (result.Type === 'normal') {
            const record = referrer.#LoadedModules.get(specifier)
            if (record) {
                if (!(record === result.Value)) assertFailed()
            } else {
                referrer.#LoadedModules.set(specifier, result.Value)
            }
        }
        const loading = referrer.#Layer0_LoadingModules.get(specifier)
        if (!loading) assertFailed()
        referrer.#Layer0_LoadingModules.delete(specifier)
        for (const state of loading) {
            if ('PromiseCapability' in state) {
                Module.#ContinueModuleLoading(state, result)
            } else {
                Module.#ContinueDynamicImport(state, result, hostDefined)
            }
        }
    }
    //#endregion
    //#region Layer 2 features
    #Layer2_VirtualModuleSource: unknown
    #Layer2_Execute: VirtualModuleRecord['execute'] | empty = empty
    #Layer2_NeedsImportMeta: boolean | undefined
    #Layer2_NeedsImport: boolean | undefined
    #Layer2_ContextObject: VirtualModuleRecordExecuteContext | undefined
    /**
     * All call to ExecuteModule must use Task.run to keep the call stack continue
     * https://tc39.es/ecma262/#sec-source-text-module-record-execute-module
     * https://tc39.es/proposal-compartments/0-module-and-module-source.html
     * https://github.com/tc39/proposal-compartments/blob/master/2-virtual-module-source.md
     */
    #Layer2_ExecuteModule(promise?: PromiseCapability<void>) {
        if (!this.#Layer2_ContextObject) assertFailed()
        if (!this.#Environment) assertFailed()

        // a virtual module might have no execute function available (a purely re-export module)
        const execute = this.#Layer2_Execute
        if (execute === empty) assertFailed()
        this.#Layer2_Execute = empty

        if (!execute) {
            promise?.Resolve()
            return
        }

        // prepare context
        this.#Layer2_ContextObject.globalThis = this.#Layer3_GlobalThis as any
        if (this.#Layer2_NeedsImportMeta) {
            // https://tc39.es/proposal-compartments/0-module-and-module-source.html#sec-meta-properties-runtime-semantics-evaluation
            const importMeta = { __proto__: null }
            if (this.#Layer0_ImportMetaHook)
                Reflect.apply(this.#Layer0_ImportMetaHook, this.#Layer0_HandlerValue, [importMeta])
            else if (this.#Layer3_ParentImportMetaHook)
                Reflect.apply(this.#Layer3_ParentImportMetaHook, undefined, [importMeta])
            this.#Layer2_ContextObject.importMeta = importMeta
        }
        if (this.#Layer2_NeedsImport) {
            // https://tc39.es/proposal-compartments/0-module-and-module-source.html#sec-import-calls
            this.#Layer2_ContextObject.import = async (
                specifier: string | Module<ModuleNamespace>,
                options?: ImportCallOptions,
            ) => {
                // 1. Let referrer be GetActiveScriptOrModule().
                const referrer = this
                // 5. Let promiseCapability be ! NewPromiseCapability(%Promise%).
                const promiseCapability = PromiseCapability<ModuleNamespace>()

                let hasModuleInternalSlot = false
                try {
                    ;(specifier as Module).#Layer0_HandlerValue
                    hasModuleInternalSlot = true
                } catch {}

                // 6. If Type(specifierOrModule) is Object that has a [[ModuleSourceInstance]] internal slot, then
                if (hasModuleInternalSlot) {
                    const hostDefined = createTask(`import(<module block>)`)
                    Module.#ContinueDynamicImport(promiseCapability, NormalCompletion(specifier as Module), hostDefined)
                } else {
                    specifier = String(specifier)
                    const hostDefined = createTask(`import("${specifier}")`)
                    Module.#Layer0_LoadImportedModule(referrer, specifier, hostDefined, promiseCapability)
                }
                return promiseCapability.Promise as any
            }
        }

        const env = new Proxy(this.#Environment, moduleEnvExoticMethods)

        // https://tc39.es/ecma262/#sec-source-text-module-record-execute-module
        // 9. If module.[[HasTLA]] is false, then
        if (!this.#HasTLA) {
            // a. Assert: capability is not present.
            if (promise) assertFailed()
            // c. Let result be Completion(Evaluation of module.[[ECMAScriptCode]]).
            // f. If result is an abrupt completion, then
            //     i. Return ? result.
            const result = Reflect.apply(execute, this.#Layer2_VirtualModuleSource, [env, this.#Layer2_ContextObject])
            if (result) {
                throw new TypeError(
                    'Due to specification limitations, in order to support Async Modules (modules that use Top Level Await or a Virtual Module that has an execute() function that returns a Promise), the Virtual Module record must be marked with `isAsync: true`. The `isAsync` property is non-standard, and it is being tracked in https://github.com/tc39/proposal-compartments/issues/84.',
                )
            }
        } else {
            // a. Assert: capability is a PromiseCapability Record.
            if (!promise) assertFailed()
            // b. Perform AsyncBlockStart(capability, module.[[ECMAScriptCode]], moduleContext).
            Promise.resolve()
                .then(() => Reflect.apply(execute, this.#Layer2_VirtualModuleSource, [env, this.#Layer2_ContextObject]))
                .then(promise.Resolve, promise.Reject)
        }
    }
    //#endregion
    //#region Layer 3 features
    #Layer3_GlobalThis: object = globalThis
    #Layer3_ParentImportHook: ImportHook = defaultImportHook
    #Layer3_ParentImportMetaHook: ImportMetaHook | undefined
    //#endregion
    /** https://tc39.es/ecma262/#sec-ContinueDynamicImport */
    static #ContinueDynamicImport(
        promiseCapability: PromiseCapability<ModuleNamespace>,
        moduleCompletion: Completion<Module>,
        hostDefined: Task,
    ) {
        if (moduleCompletion.Type === 'throw') {
            promiseCapability.Reject(moduleCompletion.Value)
            return
        }
        const module = moduleCompletion.Value
        const loadPromise = module.#LoadRequestedModules(hostDefined)
        function onRejected(reason: unknown) {
            promiseCapability.Reject(reason)
        }
        function linkAndEvaluate() {
            try {
                module.#Link()
                const evaluatePromise = module.#Evaluate(hostDefined)
                function onFulfilled() {
                    const namespace = Module.#GetModuleNamespace(module)
                    promiseCapability.Resolve(namespace)
                }
                evaluatePromise.then(onFulfilled, onRejected)
            } catch (error) {
                promiseCapability.Reject(error)
            }
        }
        loadPromise.then(linkAndEvaluate, onRejected)
    }
    /** https://tc39.es/ecma262/#sec-GetImportedModule */
    static #GetImportedModule(module: Module, spec: string) {
        const record = module.#LoadedModules.get(spec)
        if (!record) assertFailed()
        return record
    }
    /** https://tc39.es/ecma262/#sec-modulenamespacecreate */
    static #GetModuleNamespace(module: Module): ModuleNamespace {
        if (module.#Namespace) return module.#Namespace
        if (!(module.#Status !== ModuleStatus.new && module.#Status !== ModuleStatus.unlinked)) assertFailed()
        const exportedNames = module.#GetExportedNames()

        const namespaceObject: ModuleNamespace = { __proto__: null }
        const namespaceObjectBindings: PropertyDescriptorMap = {
            __proto__: null!,
            [Symbol.toStringTag]: { value: 'Module' },
        }
        const namespaceProxy = new Proxy(namespaceObject, moduleNamespaceExoticMethods)
        // set it earlier in case of circular dependency
        module.#Namespace = namespaceProxy

        for (const name of exportedNames) {
            const resolution = module.#ResolveExport(name)
            if (resolution === ambiguous || resolution === null) continue

            const { BindingName, Module: targetModule } = resolution
            if (BindingName === namespace) {
                namespaceObjectBindings[name] = { enumerable: true, value: Module.#GetModuleNamespace(targetModule) }
            } else {
                if (targetModule.#NON_SPEC_LocalExportedValues.has(BindingName)) {
                    namespaceObjectBindings[name] = {
                        enumerable: true,
                        // Note: this should not be configurable, but it's a trade-off for DX.
                        configurable: true,
                        value: targetModule.#NON_SPEC_LocalExportedValues.get(BindingName)!,
                    }
                } else {
                    namespaceObjectBindings[name] = {
                        get() {
                            throw new ReferenceError(`Cannot access '${name}' before initialization`)
                        },
                        // Note: this should not be configurable, but it's a trade-off for DX.
                        configurable: true,
                        enumerable: true,
                    }
                }
                targetModule.#NON_SPEC_AddLiveExportCallback(name, (newValue) => {
                    Object.defineProperty(namespaceObject, name, {
                        enumerable: true,
                        writable: true,
                        value: newValue,
                    })
                })
            }
        }
        Object.defineProperties(namespaceObject, namespaceObjectBindings)
        return namespaceProxy
    }
    static {
        imports = async (module, options) => {
            const promiseCapability = PromiseCapability<ModuleNamespace>()

            const hostDefined = createTask(`import(<module block>)`)
            Module.#ContinueDynamicImport(promiseCapability, NormalCompletion(module), hostDefined)
            return promiseCapability.Promise as any
        }
        setParentGlobalThis = (module, global) => (module.#Layer3_GlobalThis = global)
        setParentImportHook = (module, hook) => (module.#Layer3_ParentImportHook = hook)
        setParentImportMetaHook = (module, hook) => (module.#Layer3_ParentImportMetaHook = hook)
    }
}
Reflect.defineProperty(Module.prototype, Symbol.toStringTag, {
    configurable: true,
    value: 'Module',
})

interface GraphLoadingState {
    PromiseCapability: PromiseCapability<void>
    IsLoading: boolean
    PendingModulesCount: number
    Visited: Module[]
    HostDefined: Task
}

const enum ModuleStatus {
    new,
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
    defineProperty: () => false,
    deleteProperty: () => false,
    isExtensible: () => false,
    preventExtensions: () => true,
    getPrototypeOf: () => null,
    setPrototypeOf: (_, v) => v === null,
}

interface ResolvedBindingRecord {
    Module: Module
    BindingName: string | typeof namespace
}
