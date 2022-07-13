import { Compartment } from './compartment.js'
import { createModuleSubclass, type ImportHook } from './Module.js'
import { makeGlobalThis } from './utils/makeGlobalThis.js'

export interface ExecutionContextConstructor {
    new (global: typeof globalThis, options?: ExecutionContextOptions): typeof globalThis & {
        ExecutionContext: ExecutionContextConstructor
        Compartment: typeof Compartment
    }
}
export interface ExecutionContextOptions {
    importHook?: ImportHook
}

// @ts-ignore
export const ExecutionContext: ExecutionContextConstructor = class ExecutionContext {
    constructor(global: typeof globalThis, options?: ExecutionContextOptions) {
        if (options && typeof options.importHook !== 'function') throw new TypeError('ImportHook must be a function.')
        // TODO: Module constructor should inherit the importHook if possible.
        // TODO: ExecutionContext should inherit the importHook if possible.
        return makeGlobalThis(
            Object.prototype,
            {
                // Note: importHook does not passed to the Compartment because we will use Module as the foundation of Compartment.
                Compartment,
                ExecutionContext: _,
                createModule: createModuleSubclass,
            },
            global,
        )
    }
}
const _ = ExecutionContext
