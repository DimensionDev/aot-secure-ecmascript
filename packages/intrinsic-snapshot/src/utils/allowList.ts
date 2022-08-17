/** Those intrinsic are not suggested to be cloned. */
export const undeniable: readonly unknown[] = /*#__PURE__*/ buildUndeniable()
/**
 * The object and functions in the list are safe to share after lockdown() and no-eval.
 */
export const safeToShareAfterLockdownAndNoEval: readonly unknown[] = /*#__PURE__*/ buildSafeToShareList()

function buildUndeniable() {
    const undeniable: readonly unknown[] = [
        //
        Object.prototype,
        Function.prototype,
        Array.prototype,
        RegExp.prototype,
    ]
    Object.freeze(undeniable)
    return undeniable
}

// https://github.com/endojs/endo/blob/master/packages/ses/src/whitelist.js
function buildSafeToShareList() {
    const intrinsic = new Set<unknown>([
        isFinite,
        isNaN,
        parseFloat,
        parseInt,
        decodeURI,
        decodeURIComponent,
        encodeURI,
        encodeURIComponent,

        Array,
        ArrayBuffer,
        BigInt,
        BigInt64Array,
        BigUint64Array,
        Boolean,
        DataView,
        EvalError,
        Float32Array,
        Float64Array,
        Int8Array,
        Int16Array,
        Int32Array,
        Map,
        Number,
        Object,
        Promise,
        Proxy,
        RangeError,
        ReferenceError,
        Set,
        String,
        Symbol,
        SyntaxError,
        TypeError,
        Uint8Array,
        Uint8ClampedArray,
        Uint16Array,
        Uint32Array,
        URIError,
        WeakMap,
        WeakSet,

        JSON,
        Reflect,

        typeof escape !== 'undefined' ? escape : undefined,
        typeof unescape !== 'undefined' ? unescape : undefined,

        // lockdown
        typeof harden !== 'undefined' ? harden : undefined,
        // HandledPromise

        Date,
        Error,
        RegExp,

        Math,

        eval,
        Function,
        // Compartment

        EvalError,
        RangeError,
        ReferenceError,
        SyntaxError,
        TypeError,
        URIError,

        // IteratorPrototype
        Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())),

        // AsyncIteratorPrototype
        Object.getPrototypeOf(Object.getPrototypeOf(async function* () {}.prototype)),

        // GeneratorFunction
        function* () {}.constructor,

        // GeneratorPrototype
        Object.getPrototypeOf(function* () {}).prototype,

        // AsyncGeneratorFunction
        async function* () {}.constructor,

        // AsyncGeneratorPrototype
        Object.getPrototypeOf(async function* () {}).prototype,

        // AsyncFunction
        async function () {}.constructor,
    ])

    for (const items of [...intrinsic]) {
        intrinsic.add(Object.getPrototypeOf(items))
    }

    return Object.freeze([...intrinsic].filter(Boolean))
}
declare var harden: unknown
