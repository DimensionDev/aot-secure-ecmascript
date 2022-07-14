const proxy = Proxy.revocable({}, {})
proxy.revoke()
/** @internal */
export const opaqueProxy = proxy.proxy
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
