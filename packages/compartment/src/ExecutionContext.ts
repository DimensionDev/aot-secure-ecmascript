import { Compartment } from './compartment.js'
import { createModuleClassWithGlobalThis } from './Module.js'
import { makeGlobalThis } from './utils/makeGlobalThis.js'

export interface ExecutionContextConstructor {
    new (global: typeof globalThis): typeof globalThis & {
        ExecutionContext: ExecutionContextConstructor
        Compartment: typeof Compartment
    }
}

// @ts-ignore
export const ExecutionContext: ExecutionContextConstructor = class ExecutionContext {
    constructor(global: typeof globalThis) {
        return makeGlobalThis(
            Object.prototype,
            {
                Compartment,
                ExecutionContext: _,
                createModule: createModuleClassWithGlobalThis
            },
            global,
        )
    }
}
const _ = ExecutionContext
