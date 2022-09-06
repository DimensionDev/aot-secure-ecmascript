import lib from './createMembraneMarshall.js'
import type { Connector } from '@locker/near-membrane-base'

const connectorMap = /*#__PURE__*/ new WeakMap<object, Connector>()
const debuggerMap = /*#__PURE__*/ new WeakMap<object, object>()
export function createConnector(globalThis: object, isMainIsolate: boolean, allowDebug = false): Connector {
    if (connectorMap.has(globalThis)) return connectorMap.get(globalThis)!
    let f: Function
    lib.execute(
        {
            set default(value: Function) {
                f = value
            },
            debugTargetBookkeeping: allowDebug ? debuggerMap.set.bind(debuggerMap) : undefined,
            attachDebuggerTarget: allowDebug ? TransferablePointerTarget.attachDebuggerTarget : undefined,
            proxyTargetToLazyPropertyDescriptorStateMap: isMainIsolate ? new WeakMap() : undefined,
        },
        { globalThis },
    )
    const connector = f!(isMainIsolate ? globalThis : undefined)
    connectorMap.set(globalThis, connector)
    return connector
}

// @ts-ignore
class TransferablePointerTarget extends function (f) {
    return f
} {
    constructor(obj: object) {
        super(obj)
    }
    // Note: This field MUST NOT be read. otherwise it might break the isolation.
    #Target: unknown
    static attachDebuggerTarget(key: TransferablePointerTarget, target: object) {
        if (!debuggerMap.has(target)) return
        // Note: although attach a private field might fail (https://github.com/tc39/ecma262/pull/2807)
        // but key should always be a proxy, therefore 2807 does not apply.
        // It's also impossible to call on the same target twice because we only call it for newly created Proxy.
        new TransferablePointerTarget(key)
        key.#Target = debuggerMap.get(target)
    }
}
