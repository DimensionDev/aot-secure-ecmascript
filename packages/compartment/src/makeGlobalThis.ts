import type { Compartment } from './compartment.js'

export function makeGlobalThis(
    prototype = Object.prototype,
    compartment: typeof Compartment,
    endowments: object | undefined | null,
): typeof globalThis {
    const global = Object.create(null)

    Object.defineProperty(global, 'globalThis', {
        writable: true,
        configurable: true,
        value: global,
    })

    Object.defineProperties(
        global,
        cloneFromCurrentCompartment.reduce((previous, name) => {
            previous[name] = Object.getOwnPropertyDescriptor(globalThis, name)
            return previous
        }, Object.create(null)),
    )

    Object.defineProperty(global, 'Compartment', {
        value: compartment,
    })

    if (endowments) Object.assign(global, endowments)

    return Object.setPrototypeOf(global, prototype)
}

// https://tc39.es/ecma262/multipage/global-object.html#sec-global-object
const cloneFromCurrentCompartment = [
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
    'Date', // TODO: virtualize Date?
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
    'Math', // TODO: virtualize Math.random?
    'Reflect',
]
