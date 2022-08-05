const f = (f: Function) => Function.prototype.call.bind(f)
export const WeakMapGet: <T extends object, Q>(_this: WeakMap<T, Q>, key: T) => undefined | T = f(WeakMap.prototype.get)
export const WeakMapSet: <T extends object, Q>(_this: WeakMap<T, Q>, key: T, value: Q) => WeakMap<T, Q> = f(
    WeakMap.prototype.set,
)
export const WeakMapHas: <T extends object>(_this: WeakMap<T, any>, key: T) => boolean = f(WeakMap.prototype.has)
export const ArrayMap: <T, U>(_this: ArrayLike<T>, callback: (value: T, index: number, array: T[]) => U) => U[] = f(
    Array.prototype.map,
)
export const ArrayForEach: <T>(_this: ArrayLike<T>, callback: (value: T, index: number, array: T[]) => void) => void =
    f(Array.prototype.forEach)
