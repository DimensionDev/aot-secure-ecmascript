import {
    assignFilteredGlobalDescriptorsFromPropertyDescriptorMap,
    getFilteredGlobalOwnKeys,
    linkIntrinsics,
    VirtualEnvironment,
    type DistortionCallback,
    type Instrumentation,
    type PropertyKeys,
} from '@locker/near-membrane-base'
import { createConnector } from './membrane.js'

export interface EnvironmentOptions {
    distortionCallback?: DistortionCallback | undefined
    endowments?: PropertyDescriptorMap | undefined
    globalObjectShape?: object | undefined
    instrumentation?: Instrumentation | undefined
    debugPrivateFieldAttach?: boolean
}

const ObjectCtor = Object
const { assign: ObjectAssign } = ObjectCtor
const TypeErrorCtor = TypeError

let defaultGlobalOwnKeys: PropertyKeys | null = null

export interface MembraneInstance {
    execute<T>(func: () => T): T
    virtualEnvironment: VirtualEnvironment
}
export default function createVirtualEnvironment(
    globalObject: typeof globalThis,
    redGlobalObject: typeof globalThis,
    options?: EnvironmentOptions,
): MembraneInstance {
    if (typeof globalObject !== 'object' || globalObject === null) {
        throw new TypeErrorCtor('Missing global object virtualization target.')
    }
    const {
        distortionCallback,
        endowments,
        globalObjectShape,
        instrumentation,
        debugPrivateFieldAttach = true,
    } = ObjectAssign({ __proto__: null }, options) as EnvironmentOptions
    const blueConnector = createConnector(globalObject, debugPrivateFieldAttach)
    const env = new VirtualEnvironment({
        blueConnector,
        distortionCallback: distortionCallback!,
        instrumentation: instrumentation!,
        redConnector: createConnector(redGlobalObject, debugPrivateFieldAttach),
    })
    linkIntrinsics(env, globalObject)

    const shouldUseDefaultGlobalOwnKeys = typeof globalObjectShape !== 'object' || globalObjectShape === null
    if (shouldUseDefaultGlobalOwnKeys && defaultGlobalOwnKeys === null) {
        defaultGlobalOwnKeys = getFilteredGlobalOwnKeys(redGlobalObject)
    }

    env.lazyRemapProperties(
        globalObject,
        shouldUseDefaultGlobalOwnKeys
            ? (defaultGlobalOwnKeys as PropertyKeys)
            : getFilteredGlobalOwnKeys(globalObjectShape),
    )

    if (endowments) {
        const filteredEndowments = {}
        assignFilteredGlobalDescriptorsFromPropertyDescriptorMap(filteredEndowments, endowments)
        env.remapProperties(globalObject, filteredEndowments)
    }
    // we patched it's evaluate method to receive a method instead of a string.
    return {
        execute(f) {
            return env.evaluate(f as any)
        },
        virtualEnvironment: env,
    }
}
