/** @internal */
export const empty = Symbol()
/** @internal */
export type empty = typeof empty
/** @internal */
export const namespace = Symbol()
/** @internal */
export const ambiguous = Symbol()
/** @internal */
export const all = Symbol()
/** @internal */
export const allButDefault = Symbol()

/** @internal */
export type PromiseCapability<T> = {
    Promise: Promise<T>
    Reject: (reason: unknown) => void
    Resolve: (val: T) => void
}
/** @internal */
export function PromiseCapability<T>(): PromiseCapability<T> {
    let ok: any, err: any
    const promise = new Promise<T>((a, b) => {
        ok = a
        err = b
    })
    return { Promise: promise, Resolve: ok!, Reject: err! }
}
