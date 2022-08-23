import {
    assignFilteredGlobalDescriptorsFromPropertyDescriptorMap,
    createBlueConnector,
    getFilteredGlobalOwnKeys,
    linkIntrinsics,
    toSafeWeakMap,
    VirtualEnvironment,
    type Connector,
    type DistortionCallback,
    type Instrumentation,
    type PropertyKeys,
} from '@locker/near-membrane-base'
import { createRedConnector } from './membrane.js'

export interface EnvironmentOptions {
    distortionCallback?: DistortionCallback | undefined
    endowments?: PropertyDescriptorMap | undefined
    globalObjectShape?: object | undefined
    instrumentation?: Instrumentation | undefined
    rethrowOptimization?: boolean
}

const ObjectCtor = Object
const { assign: ObjectAssign } = ObjectCtor
const TypeErrorCtor = TypeError
const WeakMapCtor = WeakMap
const { map } = Array.prototype
const { apply } = Reflect

const globalObjectToBlueCreateHooksCallbackMap = toSafeWeakMap(new WeakMapCtor<typeof globalThis, Connector>())

let defaultGlobalOwnKeys: PropertyKeys | null = null

export interface MembraneInstance {
    execute<T>(func: () => T): T
    executeAsync<T>(func: () => PromiseLike<T>): Promise<Awaited<T>>
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
        rethrowOptimization = true,
    } = ObjectAssign({ __proto__: null }, options) as EnvironmentOptions
    let blueConnector = globalObjectToBlueCreateHooksCallbackMap.get(globalObject) as Connector | undefined
    if (blueConnector === undefined) {
        blueConnector = createBlueConnector(globalObject)
        globalObjectToBlueCreateHooksCallbackMap.set(globalObject, blueConnector)
    }
    const env = new VirtualEnvironment({
        blueConnector,
        distortionCallback: distortionCallback!,
        instrumentation: instrumentation!,
        redConnector: createRedConnector(redGlobalObject),
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
    const rethrowError = createRethrowError(globalObject)
    // we patched it's evaluate method to receive a method instead of a string.
    return {
        execute(f) {
            try {
                return env.evaluate(f as any)
            } catch (error) {
                if (rethrowOptimization) {
                    throw rethrowError(error)
                } else {
                    throw error
                }
            }
        },
        async executeAsync(f) {
            try {
                return await env.evaluate(f as any)
            } catch (error) {
                if (rethrowOptimization) {
                    throw rethrowError(error)
                } else {
                    throw error
                }
            }
        },
        virtualEnvironment: env,
    }
}
function createRethrowError(globalObject: typeof globalThis) {
    const { Error, EvalError, TypeError, RangeError, SyntaxError, AggregateError, ReferenceError } = globalObject
    return function mapper(error: any) {
        try {
            let err: any
            const ctorName = err.constructor.name
            if (ctorName === 'Error') err = new Error(err.message, { cause: err })
            else if (ctorName === 'EvalError') err = new EvalError(err.message, { cause: err })
            else if (ctorName === 'TypeError') err = new TypeError(err.message, { cause: err })
            else if (ctorName === 'RangeError') err = new RangeError(err.message, { cause: err })
            else if (ctorName === 'SyntaxError') err = new SyntaxError(err.message, { cause: err })
            else if (ctorName === 'AggregateError') {
                err = new AggregateError(apply(map, (err as AggregateError).errors, [mapper]), err.message, {
                    cause: err,
                })
            } else if (ctorName === 'ReferenceError') err = new ReferenceError(err.message, { cause: err })

            if (err) {
                err.stack = err.stack
                return err
            }

            return err || error
        } catch {
            throw error
        }
    }
}
