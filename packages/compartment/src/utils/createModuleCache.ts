import type {
    ModuleDescriptor,
    ModuleDescriptor_FullSpecReference,
    ModuleNamespace,
    ThirdPartyStaticModuleRecord,
} from '../types.js'

export function createModuleCache() {
    const moduleMap: Record<string, ModuleDescriptor> = Object.create(null)

    function addNamespace(fullSpec: string, namespace: ModuleNamespace) {
        moduleMap[fullSpec] = { namespace }
    }
    function addModuleRecord(fullSpec: string, record: ThirdPartyStaticModuleRecord, extraImportMeta?: object) {
        moduleMap[fullSpec] = { record, importMeta: extraImportMeta }
    }

    function addAlias(fullSpec: string, alias: ModuleDescriptor_FullSpecReference) {
        moduleMap[fullSpec] = alias
    }
    return { moduleMap, addNamespace, addModuleRecord, addAlias }
}
