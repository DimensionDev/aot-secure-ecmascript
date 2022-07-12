import type { Compartment } from '../compartment.js'
import type { ExecutionContext } from '../ExecutionContext.js'

/** @internal */
export interface Evaluators {
    Compartment: typeof Compartment
    ExecutionContext: typeof ExecutionContext
}
/** @internal */
export function makeGlobalThis(
    prototype: object | null,
    evaluators: Evaluators,
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
        Compartment: { writable: true, configurable: true, value: evaluators.Compartment },
        ExecutionContext: { writable: true, configurable: true, value: evaluators.ExecutionContext },
    })

    if (globals) Object.assign(global, globals)

    return Object.setPrototypeOf(global, prototype)
}

/**
 * @internal
 * @deprecated
 */
export function makeBorrowedGlobalThis(compartment: typeof Compartment, globalThis: object) {
    const global = Object.create(null)

    Object.defineProperty(global, 'Compartment', {
        value: compartment,
        configurable: true,
        writable: true,
    })

    Object.setPrototypeOf(global, globalThis)
    return global
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
