// https://github.com/tc39/proposal-compartments/blob/775024d93830ee6464363b4b373d9353425a0776/README.md
import type { Compartment } from './compartment.js'
import type { ModuleSource } from './ModuleSource.js'

export type Binding = ImportBinding | ExportBinding | ImportAllBinding | ExportAllBinding
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
export interface ImportAllBinding {
    importAllFrom: string
    as: string
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
export interface ExportAllBinding {
    exportAllFrom: string
    as?: string | undefined
}
export interface VirtualModuleRecord {
    bindings?: Array<Binding>
    execute?(environment: object, context?: VirtualModuleRecordExecuteContext): void | Promise<void>
    needsImportMeta?: boolean | undefined
    needsImport?: boolean | undefined
    isAsync?: boolean | undefined
}

export type ModuleNamespace = Record<string, unknown>
export interface VirtualModuleRecordExecuteContext {
    importMeta?: object
    import?(spec: string, options?: ImportCallOptions): Promise<ModuleNamespace>
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
    record: ModuleSource | VirtualModuleRecord | string
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
    borrowGlobals?: boolean
    globals?: object | undefined
    resolveHook(importSpec: string, referrerSpec: string): string
    moduleMap?: Record<string, ModuleDescriptor> | undefined
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
export type ModuleCacheItem =
    | { type: 'instance'; moduleInstance: ModuleNamespace }
    | { type: 'record'; module: VirtualModuleRecord; extraImportMeta: object | null | undefined }
