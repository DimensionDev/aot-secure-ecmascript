/** @internal */
export const empty = /*#__PURE__*/ Symbol('empty')
/** @internal */
export type empty = typeof empty
/** @internal */
export const namespace = /*#__PURE__*/ Symbol('namespace')
/** @internal */
export const ambiguous = /*#__PURE__*/ Symbol('ambiguous')
/** @internal */
export const all = /*#__PURE__*/ Symbol('all')
/** @internal */
export const allButDefault = /*#__PURE__*/ Symbol('all-but-default')

/** @internal */
export interface PromiseCapability<T> {
    readonly Promise: Promise<T>
    readonly Reject: (reason: unknown) => void
    readonly Resolve: (val: T) => void
    Status:
        | { Type: 'Pending'; Promise: Promise<T> }
        | { Type: 'Fulfilled'; Value: T }
        | { Type: 'Rejected'; Reason: unknown }
}
/** @internal */
export function PromiseCapability<T>(): PromiseCapability<T> {
    let ok: any, err: any
    const promise = new Promise<T>((a, b) => {
        ok = (val: T) => {
            capability.Status = { Type: 'Fulfilled', Value: val }
            a(val)
        }
        err = (error: unknown) => {
            capability.Status = { Type: 'Rejected', Reason: error }
            b(error)
        }
    })
    const capability: PromiseCapability<T> = {
        Promise: promise,
        Resolve: ok!,
        Reject: err!,
        Status: { Type: 'Pending', Promise: promise },
    }
    return capability
}
/** @internal */
export interface ModuleImportEntry {
    ModuleRequest: string
    ImportName: string | typeof namespace
    LocalName: string
}
/** @internal */
export interface ModuleExportEntry {
    ExportName: string | null
    ModuleRequest: string | null
    ImportName: string | typeof all | typeof allButDefault | null
    // LocalName: string | null
}
/** @internal */
export interface NormalCompletion<T> {
    Type: 'normal'
    Value: T
}
/** @internal */
export interface ThrowCompletion {
    Type: 'throw'
    Value: unknown
}
/** @internal */
export type Completion<T> = NormalCompletion<T> | ThrowCompletion
