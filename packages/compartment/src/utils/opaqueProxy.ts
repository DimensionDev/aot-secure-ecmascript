const proxy = Proxy.revocable(Object.create(null), {})
proxy.revoke()
/** @internal */
export const opaqueProxy = proxy.proxy
