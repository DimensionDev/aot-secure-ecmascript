import { StaticModuleRecord, StaticModuleRecordPrecompiledSymbol } from '../StaticModuleRecord.js'
import type {
    Binding,
    ModuleDescriptor,
    StaticModuleRecordPrecompiled,
    StaticModuleRecordPrecompiledInitialize,
} from '../types.js'
import { internalError } from './opaqueProxy.js'
import type { SystemJS } from './system.js'

export function createModuleCache() {
    const modules = new Map<string, ModuleDescriptor>()

    function registerPrecompiledModules(
        fullSpec: string,
        bindings: Binding[],
        needsImportMeta: boolean,
        executor: StaticModuleRecordPrecompiledInitialize,
    ): void {
        const record: StaticModuleRecordPrecompiled = {
            bindings,
            needsImportMeta,
            initialize: internalError,
            [StaticModuleRecordPrecompiledSymbol]: executor,
        }
        modules.set(fullSpec, { record: new StaticModuleRecord(record) })
    }

    function defineByNamespace(fullSpec: string, namespace: SystemJS.Module) {
        modules.set(fullSpec, { namespace })
    }
    return { registerPrecompiledModules, modules, defineByNamespace }
}
