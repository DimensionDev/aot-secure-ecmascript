// https://github.com/tc39/proposal-compartments/blob/775024d93830ee6464363b4b373d9353425a0776/README.md
import type { Compartment } from './compartment.js'
import type { SystemJS } from './index.js'
import type { StaticModuleRecord } from './StaticModuleRecord.js'

export type Binding = ImportBinding | ExportBinding
/**
 * ```
 * import { X as Y } from 'Z'
 * ```
 *
 * import = X, as = Y, from = Z
 */
export interface ImportBinding {
    import: string
    as?: string | undefined
    from: string
}
/**
 * ```
 * export { X as Y } from 'Z'
 * ```
 *
 * export = X, as = Y, from = Z
 */
export interface ExportBinding {
    export: string
    as?: string | undefined
    from?: string | undefined
}
export interface ThirdPartyStaticModuleRecord {
    bindings?: Array<Binding>
    initialize(environment: object, context: ThirdPartyStaticModuleRecordInitializeContext): void | Promise<void>
    needsImportMeta?: boolean | undefined
    needsImport?: boolean | undefined
}
export interface ThirdPartyStaticModuleRecordInitializeContext {
    importMeta?: object
    import?(spec: string, options?: ImportCallOptions): Promise<SystemJS.Module>
}

export interface StaticModuleRecordInstance {
    get bindings(): readonly Binding[]
}

export type ModuleDescriptor =
    | ModuleDescriptor_Source
    | ModuleDescriptor_StaticModuleRecord
    | ModuleDescriptor_FullSpecReference
    | ModuleDescriptor_ModuleInstance

export interface ModuleDescriptor_Source {
    source: string
    importMeta?: object | undefined
}
export interface ModuleDescriptor_StaticModuleRecord {
    record: StaticModuleRecord | ThirdPartyStaticModuleRecord | string
    importMeta?: object | undefined
}
export interface ModuleDescriptor_FullSpecReference {
    instance: string
    compartment?: Compartment | undefined
}
export interface ModuleDescriptor_ModuleInstance {
    namespace: object
}

export interface CompartmentOptions {
    // We do not support this because we running in a lockdown environment.
    inherit?: boolean
    globals?: object | undefined
    resolveHook(importSpec: string, referrerSpec: string): string
    moduleMap?: Record<string, ModuleDescriptor> | undefined
    moduleMapHook?(fullSpec: string): ModuleDescriptor | undefined
    loadHook?(fullSpec: string): Promise<ModuleDescriptor | undefined>
    importMetaHook?(fullSpec: string, importMeta: object): void
}

export interface CompartmentInstance {
    get globalThis(): object
    // Unsupported: CSP
    evaluate(source: string): unknown
    load(fullSpec: string): Promise<void>
    import(fullSpec: string): Promise<object>
    // Normative optional
    importNow?(fullSpec: string): object
    // Normative optional
    loadNow?(fullSpec: string): void
}
// Internal implementation

/** @internal */
export type ModuleCache =
    | [PROMISE_STATE.Ok, ModuleCacheItem]
    | [PROMISE_STATE.Pending, Promise<ModuleCacheItem>]
    | [PROMISE_STATE.Err, unknown]

/** @internal */
export type ModuleCacheItem =
    | { type: 'instance'; moduleInstance: SystemJS.Module }
    | { type: 'record'; module: ThirdPartyStaticModuleRecord; extraImportMeta: object | null | undefined }

/** @internal */
export const enum PROMISE_STATE {
    Ok = 0,
    Pending = 1,
    Err = 2,
}
