export type {
    Binding,
    ImportBinding,
    ExportBinding,
    CompartmentOptions,
    ModuleDescriptor,
    ModuleDescriptor_Source,
    ModuleDescriptor_ModuleInstance,
    ModuleDescriptor_FullSpecReference,
    ModuleDescriptor_StaticModuleRecord,
    ModuleNamespace,
    SyntheticModuleRecord,
    SyntheticModuleRecordInitializeContext,
} from './types.js'
export { Compartment } from './compartment.js'
export { StaticModuleRecord } from './StaticModuleRecord.js'
export { ModuleSource } from './ModuleSource.js'
export { Evaluators, type EvaluatorsConstructor } from './Evaluators.js'
export { Module, type ImportHook, imports } from './Module.js'

export { createModuleCache } from './utils/createModuleCache.js'
export { createWebImportMeta } from './utils/importMeta.js'
export { URLResolveHook } from './utils/resolver.js'
