import { ArrayMap, WeakMapGet, WeakMapHas, WeakMapSet } from './intrinsic.js'

const originalFromCloned = new WeakMap<object, object>()
export interface CloneKnowledge {
    /**
     * Map from original => cloned
     *
     * This is not a global property, because there might be multiple isolated clone of the same object.
     */
    clonedFromOriginal: WeakMap<object, object>
    /**
     * A map of original => overriding property descriptors
     *
     * When clone(original), it will override the property descriptor onto the original one.
     */
    descriptorOverride: WeakMap<object, PropertyDescriptorMap>
    /**
     * A map of original => overring cloned object
     *
     * When clone(original), it will use the overriding cloned object instead of {} or [].
     *
     * This allows an exotic object to be cloned.
     */
    emptyObjectOverride: WeakMap<object, object>
}

/**
 * Clone a value.
 */
export function clone(o: any, knowledge: CloneKnowledge): any {
    // Note: we do not support document.all because it has a very special behavior.
    if (o === $documentAll) return undefined

    // 1. If o is a primitive, return o.
    if (typeof o !== 'object' && typeof o !== 'function') return o
    if (o === null) return o

    // 2. Return previous clone result if there is one.
    if (WeakMapHas(knowledge.clonedFromOriginal, o)) return WeakMapGet(knowledge.clonedFromOriginal, o)

    // 3. If o is
    //      a. an exotic object (specified in knowledge.emptyObjectOverride), return the overriding object.
    //      b. a function, let newVal be a new forwarding function.
    //      c. an Array, let newVal be a new Array.
    //      d. an Object, let newVal be a new Object.
    const isFunction = typeof o === 'function'
    const c = WeakMapHas(knowledge.emptyObjectOverride, o)
        ? WeakMapGet(knowledge.emptyObjectOverride, o)
        : isArray(o)
        ? []
        : isFunction
        ? forwardingFunction(o, knowledge)
        : {}

    // 4. Cache the clone result
    WeakMapSet(originalFromCloned, c, o)
    WeakMapSet(knowledge.clonedFromOriginal, o, c)

    // 5. Set newVal.[[Prototype]] to cloned val.[[Prototype]].
    const proto = clone(getPrototypeOf(o), knowledge)
    setPrototypeOf(c, proto)

    // 6. Clone object descriptors
    const descriptors = getOwnPropertyDescriptors(o)
    const overrideDescriptors = WeakMapGet(knowledge.descriptorOverride, o)
    for (const key in descriptors) {
        if (isFunction && (key === 'arguments' || key === 'caller' || key === 'callee')) continue

        let descriptor = descriptors[key]!
        if (overrideDescriptors && hasOwn(overrideDescriptors, key)) {
            descriptor = overrideDescriptors[key]!
            descriptors[key] = descriptor
        }
        if (!descriptor) continue
        if (hasOwn(descriptor, 'get')) descriptor.get = clone(descriptor.get, knowledge)
        if (hasOwn(descriptor, 'set')) descriptor.set = clone(descriptor.set, knowledge)
        if (hasOwn(descriptor, 'value')) descriptor.value = clone(descriptor.value, knowledge)
    }
    defineProperties(c, descriptors)
    return c
}

// Let's keep the result of toString if possible
try {
    const old = Function.prototype.toString
    const ff = () =>
        function (this: any) {
            if (WeakMapHas(originalFromCloned, this)) return apply(old, WeakMapGet(originalFromCloned, this), arguments)
            return apply(old, this, arguments)
        }
    const f = ff()
    Function.prototype.toString = f
} catch {}

/**
 * Create a function that forward [[Call]] and [[Construct]] to the original function.
 *
 * It does not contain extra properties like [[Prototype]], .prototype, .length.
 *
 * @param oldF The function to be called
 * @param knowledge The clone knowledge
 * @returns Cloned function
 */
function forwardingFunction(oldF: Function, knowledge: CloneKnowledge): Function {
    const f = {
        [oldF.name]: function () {
            const args = ArrayMap(arguments, (value) => WeakMapGet(originalFromCloned, value) ?? value)

            try {
                if (new.target) {
                    return clone(
                        construct(oldF, args, WeakMapGet(originalFromCloned, new.target) ?? new.target),
                        knowledge,
                    )
                }
                return clone(apply(oldF, WeakMapGet(originalFromCloned, this) ?? this, args), knowledge)
            } catch (error) {
                throw clone(error, knowledge)
            }
        },
    }[oldF.name]
    return f!
}

const tryEval = <T>(f: () => T): T | undefined => {
    try {
        return f()
    } catch {}
    return undefined
}

const { isArray } = Array
const { apply, construct, getPrototypeOf, setPrototypeOf } = Reflect
const { getOwnPropertyDescriptors, hasOwn, defineProperties } = Object
const $documentAll = tryEval(() => document.all)
