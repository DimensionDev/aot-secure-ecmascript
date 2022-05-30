const proxy = Proxy.revocable({}, {})
proxy.revoke()
/** @internal */
export const opaqueProxy = proxy.proxy
export function internalError(): never {
    throw new TypeError('Compartment encounters an internal error.')
}
