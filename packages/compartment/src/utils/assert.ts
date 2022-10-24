function getOpaqueProxy() {
    const x = Proxy.revocable({}, {})
    x.revoke()
    return x.proxy
}

/** @internal */
export const opaqueProxy = /*#__PURE__*/ getOpaqueProxy()
/** @internal */
export function assertFailed(message?: string): never {
    throw new TypeError('Assertion failed.' + (message ? ' ' : '') + message)
}
/** @internal */
export function unreachable(val: never): never {
    throw new TypeError('Unreachable')
}
