import type {
    Binding,
    ModuleDescriptor,
    ModuleDescriptor_FullSpecReference,
    ModuleNamespace,
    VirtualModuleRecord,
} from '../types.js'

export function createModuleCache() {
    const moduleMap: Record<string, ModuleDescriptor> = Object.create(null)

    function addNamespace(fullSpec: string, namespace: ModuleNamespace, bindings?: Binding[]) {
        if (bindings) {
            moduleMap[fullSpec] = {
                record: {
                    execute(env: any) {
                        for (const [key, val] of Object.entries(namespace)) {
                            env[key] = val
                        }
                    },
                    bindings: bindings.concat(Object.keys(namespace).map((x) => ({ export: x }))),
                },
            }
        } else {
            moduleMap[fullSpec] = { namespace }
        }
    }
    function addModuleRecord(fullSpec: string, record: VirtualModuleRecord, extraImportMeta?: object) {
        moduleMap[fullSpec] = { record, importMeta: extraImportMeta }
    }

    function addAlias(fullSpec: string, alias: ModuleDescriptor_FullSpecReference) {
        moduleMap[fullSpec] = alias
    }
    return { moduleMap, addNamespace, addModuleRecord, addAlias }
}
