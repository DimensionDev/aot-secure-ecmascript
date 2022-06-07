import { brandCheck_Compartment } from '../compartment.js'
import { StaticModuleRecord } from '../StaticModuleRecord.js'
import type {
    ModuleDescriptor,
    ModuleDescriptor_Source,
    ModuleDescriptor_StaticModuleRecord,
    ThirdPartyStaticModuleRecord,
    ModuleDescriptor_ModuleInstance,
    Binding,
    ExportBinding,
    ImportBinding,
} from '../types.js'
import {
    isImportBinding,
    isModuleDescriptor_FullSpecReference,
    isModuleDescriptor_ModuleInstance,
    isModuleDescriptor_Source,
    isModuleDescriptor_StaticModuleRecord,
} from './shapeCheck.js'

/** @internal */
export function normalizeModuleDescriptor(desc: ModuleDescriptor | undefined | null): ModuleDescriptor | undefined {
    if (!desc) return undefined
    if (isModuleDescriptor_Source(desc)) {
        const { source, importMeta } = desc
        const copy: ModuleDescriptor_Source = {
            source: normalizeString(source),
            importMeta: normalizeImportMeta(importMeta),
        }
        return copy
    } else if (isModuleDescriptor_StaticModuleRecord(desc)) {
        const { record, importMeta } = desc
        let normalizedRecord: ModuleDescriptor_StaticModuleRecord['record']
        if (typeof record === 'string') {
            normalizedRecord = record
        } else if (typeof record !== 'object' || record === null) {
            throw new TypeError(
                'ModuleDescriptor must be either a string, StaticModuleRecord or ThirdPartyStaticModuleRecord',
            )
        } else if (record instanceof StaticModuleRecord) {
            throw new TypeError('StaticModuleRecord is not supported')
        } else {
            const { initialize, needsImportMeta, needsImport, bindings } = record
            const _: ThirdPartyStaticModuleRecord = (normalizedRecord = {
                initialize,
                needsImportMeta: Boolean(needsImportMeta),
                needsImport: Boolean(needsImport),
                bindings: normalizeBindings(bindings),
            })

            if (typeof initialize !== 'function')
                throw new TypeError('ThirdPartyStaticModuleRecord.initialize must be a function')
        }
        const copy: ModuleDescriptor_StaticModuleRecord = { record, importMeta: normalizeImportMeta(importMeta) }
        return copy
    } else if (isModuleDescriptor_FullSpecReference(desc)) {
        const { instance, compartment } = desc
        if (compartment && !brandCheck_Compartment(compartment)) {
            throw new TypeError('moduleDescriptor.compartment is not a Compartment')
        }
        const copy: ModuleDescriptor = { instance: `${instance}`, compartment }
        return copy
    } else if (isModuleDescriptor_ModuleInstance(desc)) {
        const copy: ModuleDescriptor_ModuleInstance = { namespace: Object.assign({ __proto__: null }, desc.namespace) }
        return copy
    } else {
        throw new TypeError('moduleDescriptor is not a valid descriptor.')
    }
}

/** @internal */
export function normalizeImportMeta(importMeta: object | undefined | null) {
    if (!importMeta) return undefined
    if (typeof importMeta !== 'object') throw new TypeError('Compartment: importMeta must be an object')
    return importMeta
}

/** @internal */
export function normalizeBindings(binding: Binding[] | undefined): Binding[] {
    if (!binding) return []
    if (!Array.isArray(binding)) throw new TypeError('bindings must be an array.')
    const result: Binding[] = []
    for (const item of binding) {
        const i = (item as ImportBinding).import
        const e = (item as ExportBinding).export
        if (typeof i !== 'undefined' && typeof e !== 'undefined') {
            throw new TypeError('A ModuleBinding cannot have both "import" and "export".')
        }
        const { as, from } = item

        if (typeof i !== 'undefined') {
            if (from === undefined || from === null)
                throw new TypeError('An ImportBinding must have a "from" property.')
            result.push(
                Object.freeze({
                    import: normalizeString(i),
                    as: normalizeStringOrUndefined(as),
                    from: normalizeString(from),
                }),
            )
        } else if (typeof e !== 'undefined') {
            result.push(
                Object.freeze({
                    export: normalizeString(e),
                    as: normalizeStringOrUndefined(as),
                    from: normalizeStringOrUndefined(from),
                }),
            )
        } else {
            throw new TypeError('A ModuleBinding must have either "import" or "export".')
        }
    }
    Object.freeze(result)

    const LexicallyDeclaredNames = new Set<string>()
    const ExportedNames = new Set<string>()
    for (const item of result) {
        if (isImportBinding(item)) {
            const bind = item.as || item.import
            if (LexicallyDeclaredNames.has(bind)) throw new TypeError(`Duplicate lexical binding for "${bind}"`)
            LexicallyDeclaredNames.add(bind)
        } else if (item.from === undefined) {
            const bind = item.as || item.export
            if (ExportedNames.has(bind)) throw new TypeError(`Duplicate export binding for "${bind}"`)
            ExportedNames.add(bind)
        }
    }
    return result
}

function normalizeString(x: any) {
    return `${x}`
}
function normalizeStringOrUndefined(x: any) {
    return x === undefined ? undefined : `${x}`
}
