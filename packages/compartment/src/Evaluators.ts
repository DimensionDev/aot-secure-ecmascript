import {
    Module,
    Module as TopModule,
    setParentGlobalThis,
    setParentImportHook,
    setParentImportMetaHook,
} from './Module.js'
import type { ModuleSource } from './ModuleSource.js'
import type { ImportHook, ModuleHandler, VirtualModuleRecord } from './types.js'

export interface EvaluatorsOptions {
    globalThis?: object
    importHook?: ImportHook
    importMeta?: object | null
}
export class Evaluators {
    constructor(options: EvaluatorsOptions) {
        const { globalThis = realGlobalThis, importHook = defaultImportHook, importMeta = null } = options
        this.#options = options

        if (typeof globalThis !== 'object') throw new TypeError('globalThis must be an object')
        if (typeof importHook !== 'function') throw new TypeError('importHook must be a function')
        if (typeof importMeta !== 'object') throw new TypeError('importMeta must be an object')

        const parent = this
        class Evaluators extends TopEvaluators {
            constructor(options: EvaluatorsOptions) {
                const {
                    globalThis = parent.#globalThis,
                    importHook = parent.#importHook,
                    importMeta = parent.#importMeta ?? null,
                } = options
                super({ globalThis, importHook, importMeta })
            }
        }
        class Module extends TopModule {
            constructor(moduleSource: ModuleSource | VirtualModuleRecord, handler: ModuleHandler) {
                super(moduleSource, handler)
                setParentGlobalThis(this, parent.#globalThis)
                setParentImportHook(this, parent.#importHook)
                setParentImportMetaHook(this, (meta) => Object.assign(meta, parent.#importMeta))
            }
        }
        this.#importHook = importHook
        this.#importMeta = importMeta ?? undefined
        this.#globalThis = globalThis

        this.Module = Module
        this.Evaluators = Evaluators
    }
    Module: typeof Module
    Evaluators: typeof Evaluators
    get globalThis() {
        return this.#globalThis
    }
    // We do not support `eval` and `Function`.
    eval = eval
    Function = Function
    #globalThis: object
    #importHook: ImportHook
    #importMeta: object | undefined
    #options: EvaluatorsOptions
}
const TopEvaluators = Evaluators
const realGlobalThis = globalThis

/** @internal */
export function defaultImportHook(): never {
    throw new TypeError(`This evaluator does not have any import resolution strategy.`)
}
