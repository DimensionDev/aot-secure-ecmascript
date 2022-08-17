import { Evaluators } from '../Evaluators.js'
import { createModuleSubclass, type Module } from '../Module.js'
import { ModuleSource } from '../ModuleSource.js'

/** @internal */
export interface Evaluator {
    createModule: (globalThis: object) => typeof Module
}
/** @internal */
export function makeGlobalThis(
    prototype: object | null,
    evaluators: Evaluator,
    globals: object | undefined | null,
): typeof globalThis {
    const global = Object.create(null)

    Object.defineProperties(
        global,
        intrinsic.reduce((previous, name) => {
            previous[name] = Object.getOwnPropertyDescriptor(globalThis, name)
            return previous
        }, Object.create(null)),
    )

    Object.defineProperties(global, {
        globalThis: { writable: true, configurable: true, value: global },
        Evaluators: { writable: true, configurable: true, value: Evaluators },
        ModuleSource: { writable: true, configurable: true, value: ModuleSource },
        Module: { writable: true, configurable: true, value: evaluators.createModule(global) },
    })

    if (globals) Object.assign(global, globals)

    return Object.setPrototypeOf(global, prototype)
}

export function makeGlobalThisPublic() {
    return makeGlobalThis(Object.prototype, { createModule: createModuleSubclass }, {})
}

// https://tc39.es/ecma262/multipage/global-object.html#sec-global-object
const intrinsic = [
    'Infinity',
    'NaN',
    'undefined',

    // Note: This library has an assumption that NO eval is available due to CSP.
    // Therefore we use the original version to make it looks like a "native function".

    // This library runs under SES lockdown environment, so we cannot modify Function.prototype.toString to do that.
    'eval',
    'isFinite',
    'isNaN',
    'parseFloat',
    'parseInt',
    'decodeURI',
    'decodeURIComponent',
    'encodeURI',
    'encodeURIComponent',

    'AggregateError',
    'Array',
    'ArrayBuffer',
    'BigInt',
    'BigInt64Array',
    'BigUint64Array',
    'Boolean',
    'Date',
    'DataView',
    'Error',
    'EvalError',
    'FinalizationRegistry',
    'Float32Array',
    'Float64Array',
    // Note: Same as eval.
    'Function',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Map',
    'Number',
    'Object',
    'Promise',
    'Proxy',
    'RangeError',
    'ReferenceError',
    'RegExp',
    'Set',
    // NO SharedArrayBuffer!
    'String',
    'Symbol',
    'SyntaxError',
    'TypeError',
    'Uint8Array',
    'Uint8ClampedArray',
    'Uint16Array',
    'Uint32Array',
    'URIError',
    'WeakMap',
    'WeakRef',
    'WeakSet',

    // NO Atomics (because we don't have SharedArrayBuffer)
    'JSON',
    'Math',
    'Reflect',
]
