function getOpaqueProxy() {
    const x = Proxy.revocable({}, {})
    x.revoke()
    return x.proxy
}

/** @internal */
export const opaqueProxy = /*#__PURE__*/ getOpaqueProxy()
/** @internal */
export function internalError(): never {
    throw new TypeError('Internal error.')
}
/** @internal */
export function assert(val: any): asserts val {
    if (!val) throw new TypeError('Internal error.')
}
/** @internal */
export function unreachable(val: never): never {
    throw new TypeError('Unreachable')
}
