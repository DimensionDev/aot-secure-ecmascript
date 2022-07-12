const proxy = Proxy.revocable({}, {})
proxy.revoke()
/** @internal */
export const opaqueProxy = proxy.proxy
/** @internal */
export function internalError(): never {
    throw new TypeError('Compartment encounters an internal error.')
}
/** @internal */
export function assert(val: any): asserts val {
    if (!val) internalError()
}
