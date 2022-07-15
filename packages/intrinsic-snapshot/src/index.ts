export * from './utils/clone.js'
/** Those intrinsic are not suggested to be cloned. */
export const undeniable = [Object.prototype, Function.prototype, Array.prototype, RegExp.prototype]
Object.freeze(undeniable)
