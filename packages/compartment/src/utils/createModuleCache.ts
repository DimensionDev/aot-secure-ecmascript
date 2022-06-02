import type { StaticModuleRecord } from '../index.js'
import type { ModuleDescriptor } from '../types.js'
import type { SystemJS } from './system.js'

export function createModuleCache() {
    const modules = new Map<string, ModuleDescriptor>()

    function defineByNamespace(fullSpec: string, namespace: SystemJS.Module) {
        modules.set(fullSpec, { namespace })
    }
    function defineByStaticModuleRecord(fullSpec: string, record: StaticModuleRecord) {
        modules.set(fullSpec, { record })
    }
    return { modules, defineByNamespace, defineByStaticModuleRecord }
}
