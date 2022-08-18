// https://github.com/tc39/proposal-compartments/blob/775024d93830ee6464363b4b373d9353425a0776/README.md

import type { Module } from './Module.js'

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
    execute?(environment: any, context?: VirtualModuleRecordExecuteContext): void | Promise<void>
    needsImportMeta?: boolean | undefined
    needsImport?: boolean | undefined
    isAsync?: boolean | undefined
}

export type ModuleNamespace = Record<string, unknown>
export interface VirtualModuleRecordExecuteContext {
    importMeta?: object
    import?(spec: string, options?: ImportCallOptions): Promise<ModuleNamespace>
    globalThis: typeof globalThis
}

export interface StaticModuleRecordInstance {
    get bindings(): readonly Binding[]
}
export type ImportHook = (importSpecifier: string, referrer: Referral) => PromiseLike<Module | null> | Module | null
export type Referral = symbol | string | number | bigint
