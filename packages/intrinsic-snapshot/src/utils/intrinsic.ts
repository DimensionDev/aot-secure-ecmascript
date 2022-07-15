const { apply } = Reflect
const takeThis =
    <A extends any[], R, T>(f: (this: T, ...args: A) => R): ((_this: T, ...args: A) => R) =>
    (_this, ...args) =>
        apply(f, _this, args)
export const WeakMapGet = takeThis(WeakMap.prototype.get)
export const WeakMapSet = takeThis(WeakMap.prototype.set)
export const WeakMapHas = takeThis(WeakMap.prototype.has)
export const ArrayMap = takeThis(Array.prototype.map)
export const ArrayForEach = takeThis(Array.prototype.forEach)
