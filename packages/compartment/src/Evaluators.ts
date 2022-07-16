import { Compartment } from './compartment.js'
import { createModuleSubclass, type ImportHook } from './Module.js'
import { makeGlobalThis } from './utils/makeGlobalThis.js'

export interface EvaluatorsConstructor {
    new (global: typeof globalThis, options?: EvaluatorsOptions): typeof globalThis & {
        Evaluators: EvaluatorsConstructor
        Compartment: typeof Compartment
    }
}
export interface EvaluatorsOptions {
    importHook?: ImportHook
}

// @ts-ignore
export const Evaluators: EvaluatorsConstructor = class Evaluators {
    constructor(global: typeof globalThis, options?: EvaluatorsOptions) {
        if (options && typeof options.importHook !== 'function') throw new TypeError('ImportHook must be a function.')
        // TODO: Module constructor should inherit the importHook if possible.
        // TODO: Evaluators should inherit the importHook if possible.
        return makeGlobalThis(
            Object.prototype,
            {
                // Note: importHook does not passed to the Compartment because we will use Module as the foundation of Compartment.
                Compartment,
                Evaluators: _,
                createModule: createModuleSubclass,
            },
            global,
        )
    }
}
const _ = Evaluators
