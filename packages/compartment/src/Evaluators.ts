import { createModuleSubclass, Module, type ImportHook } from './Module.js'

export class Evaluators {
    constructor(options: { globalThis?: object; importHook?: ImportHook; importMeta?: object }) {
        const { globalThis, importHook, importMeta } = options
        if (globalThis !== null && globalThis !== undefined && typeof globalThis !== 'object') {
            throw new TypeError('globalThis must be an object')
        }
        if (importHook !== null && importHook !== undefined && typeof importHook !== 'function') {
            throw new TypeError('importHook must be a function')
        }
        if (importMeta !== null && importMeta !== undefined && typeof importMeta !== 'object') {
            throw new TypeError('importMeta must be an object')
        }
        this.#globalThis = globalThis ?? { __proto__: null }
        this.Module = createModuleSubclass(this.#globalThis, importHook, importMeta)
    }
    #globalThis: object
    Module: typeof Module
    get globalThis() {
        return this.#globalThis
    }
    // We do not support `eval` and `Function`.
    eval = eval
    Function = Function
}
