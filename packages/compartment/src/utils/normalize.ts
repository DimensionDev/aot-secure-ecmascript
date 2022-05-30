import { brandCheck_Compartment } from '../compartment.js'
import { brandCheck_StaticModuleRecord } from '../StaticModuleRecord.js'
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
        const copy: ModuleDescriptor_Source = { source: `${source}`, importMeta: normalizeImportMeta(importMeta) }
        return copy
    } else if (isModuleDescriptor_StaticModuleRecord(desc)) {
        const { record, importMeta } = desc
        let normalizedRecord: ModuleDescriptor_StaticModuleRecord['record']
        if (typeof record === 'string') {
            normalizedRecord = record
        } else if (brandCheck_StaticModuleRecord(record)) {
            normalizedRecord = record
        } else {
            const { initialize, needsImportMeta, bindings } = record
            const _: ThirdPartyStaticModuleRecord = (normalizedRecord = {
                initialize,
                needsImportMeta: Boolean(needsImportMeta),
                bindings: normalizeBindings(bindings),
            })

            if (typeof initialize !== 'function')
                throw new TypeError('Compartment: ThirdPartyStaticModuleRecord.initialize must be a function')
        }
        const copy: ModuleDescriptor_StaticModuleRecord = { record, importMeta: normalizeImportMeta(importMeta) }
        return copy
    } else if (isModuleDescriptor_FullSpecReference(desc)) {
        const { instance, compartment } = desc
        if (compartment && !brandCheck_Compartment(compartment)) {
            throw new TypeError('Compartment: moduleDescriptor.compartment is not a Compartment')
        }
        const copy: ModuleDescriptor = { instance: `${instance}`, compartment }
        return copy
    } else if (isModuleDescriptor_ModuleInstance(desc)) {
        const copy: ModuleDescriptor_ModuleInstance = { namespace: Object.assign({ __proto__: null }, desc.namespace) }
        return copy
    } else {
        throw new TypeError('Compartment: moduleDescriptor is not a valid descriptor.')
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
            result.push(Object.freeze({ import: `${i}`, as: `${as}`, from: `${from}` }))
        } else if (typeof e !== 'undefined') {
            result.push(Object.freeze({ export: `${e}`, as: `${as}`, from: `${from}` }))
        } else {
            throw new TypeError('A ModuleBinding must have either "import" or "export".')
        }
    }
    Object.freeze(result)
    return result
}
