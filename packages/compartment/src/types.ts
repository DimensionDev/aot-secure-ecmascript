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
    bindings?: Array<Binding> | undefined
    execute?: ((environment: any, context: VirtualModuleRecordExecuteContext) => void | Promise<void>) | undefined
    needsImportMeta?: boolean | undefined
    needsImport?: boolean | undefined
    isAsync?: boolean | undefined
}

export type ModuleNamespace = Record<string, unknown>
export interface VirtualModuleRecordExecuteContext {
    importMeta?: object
    import?<T extends ModuleNamespace = ModuleNamespace>(
        spec: string | Module<T>,
        options?: ImportCallOptions,
    ): Promise<T>
    globalThis: typeof globalThis
}

export type ImportHook = (importSpecifier: string) => PromiseLike<Module | null> | Module | null
export type ImportMetaHook = (importMeta: object) => void
export interface ModuleHandler {
    importHook?: ImportHook | undefined
    importMetaHook?: ImportMetaHook
}
