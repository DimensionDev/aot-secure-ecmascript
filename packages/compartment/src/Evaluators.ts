import { Module, setParentGlobalThis, setParentImportHook, setParentImportMetaHook } from './Module.js'
import type { ModuleSource } from './ModuleSource.js'
import type { ImportHook, ModuleHandler, VirtualModuleRecord } from './types.js'

export interface EvaluatorsOptions {
    globalThis?: object | undefined
    importHook?: ImportHook | undefined
    importMeta?: object | null | undefined
}
export class Evaluators {
    Module: typeof Module
    Evaluators: typeof Evaluators
    get globalThis() {
        return this.#AssignGlobalThis
    }
    // We do not support `eval` and `Function`.
    eval = eval
    Function = Function

    // implementation
    constructor(handler: EvaluatorsOptions) {
        const { globalThis, importHook, importMeta } = handler
        this.#Handler = handler

        if (typeof globalThis !== 'object' && globalThis !== undefined)
            throw new TypeError('globalThis must be an object')
        if (typeof importHook !== 'function' && importHook !== undefined)
            throw new TypeError('importHook must be a function')
        if (typeof importMeta !== 'object' && importMeta !== undefined && importMeta !== null)
            throw new TypeError('importMeta must be an object')

        const parent = this
        class Evaluators extends TopEvaluators {
            constructor(options: EvaluatorsOptions) {
                super(options)
                this.#ParentEvaluator = parent
            }
        }
        class Module extends TopModule {
            constructor(moduleSource: ModuleSource | VirtualModuleRecord, handler: ModuleHandler) {
                super(moduleSource, handler)
                setParentGlobalThis(this, (parent.#CalculatedGlobalThis ??= parent.#GetGlobalThis()))
                setParentImportHook(this, (parent.#CalculatedImportHook ??= parent.#GetImportHook()))
                setParentImportMetaHook(this, (meta) =>
                    Object.assign(meta, (parent.#CalculatedImportMeta ??= parent.#GetImportMeta())),
                )
            }
        }
        this.#AssignedImportHook = importHook
        this.#AssignedImportMeta = importMeta
        this.#AssignGlobalThis = globalThis

        this.Module = Module
        this.Evaluators = Evaluators
    }
    #ParentEvaluator: Evaluators | undefined
    #AssignGlobalThis: object | undefined
    #AssignedImportHook: ImportHook | undefined
    #AssignedImportMeta: object | undefined | null
    #CalculatedGlobalThis: object | undefined
    #CalculatedImportHook: ImportHook | undefined
    #CalculatedImportMeta: object | undefined | null
    #Handler: EvaluatorsOptions

    #GetGlobalThis(): object {
        if (this.#AssignGlobalThis) return this.#AssignGlobalThis
        if (this.#ParentEvaluator) return this.#ParentEvaluator.#GetGlobalThis()
        return realGlobalThis
    }
    #GetImportHook(): ImportHook {
        if (this.#AssignedImportHook) return this.#AssignedImportHook.bind(this.#Handler)
        if (this.#ParentEvaluator) return this.#ParentEvaluator.#GetImportHook()
        return defaultImportHook
    }
    #GetImportMeta(): ImportMeta | null {
        if (this.#AssignedImportMeta) return this.#AssignedImportMeta
        if (this.#ParentEvaluator) return this.#ParentEvaluator.#GetImportMeta()
        return null
    }
}
const TopEvaluators = Evaluators
const TopModule = Module
const realGlobalThis = globalThis

/** @internal */
export function defaultImportHook(): never {
    throw new TypeError(`This evaluator does not have any import resolution strategy.`)
}
