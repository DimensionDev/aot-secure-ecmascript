import type { VirtualModuleRecord, Binding, ExportAllBinding, ImportBinding } from '../types.js'
import { assertFailed, unreachable } from './assert.js'
import { hasFromField, isExportAllBinding, isExportBinding, isImportAllBinding, isImportBinding } from './shapeCheck.js'
import { all, allButDefault, namespace, type ModuleExportEntry, type ModuleImportEntry } from './spec.js'

/** @internal */
export function normalizeVirtualModuleRecord(module: VirtualModuleRecord): VirtualModuleRecord {
    const { execute, bindings, needsImport, needsImportMeta, isAsync } = module
    if (execute !== undefined && execute !== null && typeof execute !== 'function') {
        throw new TypeError('VirtualModuleRecord.execute must be a function')
    }
    return {
        execute,
        needsImportMeta: Boolean(needsImportMeta),
        needsImport: Boolean(needsImport),
        isAsync: Boolean(isAsync),
        bindings: normalizeBindings(bindings),
    }
}

/** @internal */
export function normalizeImportMeta(importMeta: object | undefined | null) {
    if (!importMeta) return undefined
    if (typeof importMeta !== 'object') throw new TypeError('importMeta must be an object')
    return importMeta
}

/** @internal */
export function normalizeBindings(binding: Binding[] | undefined): Binding[] {
    if (!binding) return []
    if (!Array.isArray(binding)) throw new TypeError('bindings must be an array.')
    const result: Binding[] = []
    for (const item of binding) {
        if ('importAllFrom' in item) {
            if (!('as' in item)) throw new TypeError('ImportAllBinding must have an "as" field.')
            if ('exportAllFrom' in item || 'import' in item || 'export' in item || 'from' in item)
                throw new TypeError(
                    'ImportAllBinding cannot have "exportAllFrom", "import", "export", or "from" fields.',
                )
            result.push({
                importAllFrom: normalizeString(item.importAllFrom),
                as: normalizeString(item.as),
            })
        } else if ('exportAllFrom' in item) {
            if ('importAllFrom' in item || 'import' in item || 'export' in item || 'from' in item)
                throw new TypeError(
                    'ExportAllBinding cannot have "importAllFrom", "import", "export", or "from" fields.',
                )
            result.push({
                exportAllFrom: normalizeString(item.exportAllFrom),
                as: normalizeStringOrUndefined(item.as),
            })
        } else if ('import' in item) {
            if (!('from' in item)) throw new TypeError('ImportBinding must have a "from" field.')
            if ('exportAllFrom' in item || 'importAllFrom' in item || 'export' in item)
                throw new TypeError('ImportBinding cannot have "exportAllFrom", "importAllFrom", or "export" fields.')
            result.push({
                import: normalizeString(item.import),
                from: normalizeString(item.from),
                as: normalizeStringOrUndefined(item.as),
            })
        } else if ('export' in item) {
            if ('exportAllFrom' in item || 'importAllFrom' in item || 'import' in item)
                throw new TypeError('ExportBinding cannot have "exportAllFrom", "importAllFrom", or "import" fields.')
            result.push({
                export: normalizeString(item.export),
                from: normalizeStringOrUndefined(item.from),
                as: normalizeStringOrUndefined(item.as),
            })
        } else {
            throw new TypeError(
                'binding must be one of ImportBinding, ExportBinding, ImportAllBinding or ExportAllBinding.',
            )
        }
    }
    Object.freeze(result)

    const LexicallyDeclaredNames = new Set<string>()
    const ExportedNames = new Set<string>()
    for (const item of result) {
        if (isImportBinding(item) || isImportAllBinding(item)) {
            const bind = item.as || (item as ImportBinding).import
            if (LexicallyDeclaredNames.has(bind)) throw new TypeError(`Duplicate lexical binding for "${bind}"`)
            LexicallyDeclaredNames.add(bind)
        } else if (isExportBinding(item)) {
            const bind = item.as || item.export
            if (ExportedNames.has(bind)) throw new TypeError(`Duplicate export binding for "${bind}"`)
            ExportedNames.add(bind)
        } else {
            const _: ExportAllBinding = item
        }
    }
    return result
}

/** @internal */
export function normalizeBindingsToSpecRecord(bindings: Binding[] | undefined) {
    // bindings = normalizeBindings(bindings) || []
    bindings ??= []
    const requestedModules: string[] = []
    for (const binding of bindings) {
        if (isImportBinding(binding)) requestedModules.push(binding.from)
        else if (isImportAllBinding(binding)) requestedModules.push(binding.importAllFrom)
        else if (isExportBinding(binding)) {
            if (hasFromField(binding)) requestedModules.push(binding.from)
        } else if (isExportAllBinding(binding)) requestedModules.push(binding.exportAllFrom)
        else unreachable(binding)
    }
    const importEntries: ModuleImportEntry[] = []
    for (const binding of bindings) {
        if (isImportBinding(binding)) {
            importEntries.push({
                ImportName: binding.import,
                LocalName: binding.as ?? binding.import,
                ModuleRequest: binding.from,
            })
        } else if (isImportAllBinding(binding)) {
            importEntries.push({
                ImportName: namespace,
                LocalName: binding.as,
                ModuleRequest: binding.importAllFrom,
            })
        }
    }
    const indirectExportEntries: ModuleExportEntry[] = []
    const localExportEntries: ModuleExportEntry[] = []
    const starExportEntries: ModuleExportEntry[] = []

    for (const binding of bindings) {
        // step 10.a: if ee.ModuleRequest is null, then append ee to localExportEntries
        // export { ... }
        if (isExportBinding(binding) && !hasFromField(binding)) {
            localExportEntries.push({
                ExportName: binding.as ?? binding.export,
                ImportName: null,
                ModuleRequest: null,
            })
        }
        // step 10.b: else if ee.ImportName is all-but-default, then append ee to starExportEntries
        // export * from '...'
        else if (isExportAllBinding(binding) && binding.as === undefined) {
            starExportEntries.push({
                // LocalName: null,
                ExportName: null,
                ImportName: allButDefault,
                ModuleRequest: binding.exportAllFrom,
            })
        }
        // step 10.c: else, append ee to indirectExportEntries
        // export * as T from '...'
        // export { T } from '...'
        else {
            if (isExportAllBinding(binding)) {
                if (!(binding.as !== undefined)) assertFailed()
                indirectExportEntries.push({
                    ExportName: binding.as,
                    ImportName: all,
                    ModuleRequest: binding.exportAllFrom,
                })
            } else if (isExportBinding(binding)) {
                indirectExportEntries.push({
                    ExportName: binding.as ?? binding.export,
                    ImportName: binding.export,
                    ModuleRequest: binding.from,
                })
            }
        }
    }

    return {
        requestedModules: [...new Set(requestedModules)],
        importEntries,
        indirectExportEntries,
        localExportEntries,
        starExportEntries,
    }
}

function normalizeString(x: any) {
    return `${x}`
}
function normalizeStringOrUndefined(x: any) {
    return x === undefined ? undefined : `${x}`
}
