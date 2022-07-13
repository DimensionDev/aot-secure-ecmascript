import type {
    ModuleDescriptor_FullSpecReference,
    ModuleDescriptor_Source,
    ModuleDescriptor_ModuleInstance,
    ModuleDescriptor_StaticModuleRecord,
    ModuleDescriptor,
    Binding,
    ImportBinding,
    ExportBinding,
    ImportAllBinding,
    ExportAllBinding,
} from '../types.js'

/** @internal */
export function isModuleDescriptor_FullSpecReference(
    descriptor: ModuleDescriptor,
): descriptor is ModuleDescriptor_FullSpecReference {
    return 'instance' in descriptor
}

/** @internal */
export function isModuleDescriptor_Source(descriptor: ModuleDescriptor): descriptor is ModuleDescriptor_Source {
    return 'source' in descriptor
}

/** @internal */
export function isModuleDescriptor_StaticModuleRecord(
    descriptor: ModuleDescriptor,
): descriptor is ModuleDescriptor_StaticModuleRecord {
    return 'record' in descriptor
}

/** @internal */
export function isModuleDescriptor_ModuleInstance(
    descriptor: ModuleDescriptor,
): descriptor is ModuleDescriptor_ModuleInstance {
    return 'namespace' in descriptor
}

/** @internal */
export function isImportBinding(binding: Binding): binding is ImportBinding {
    return 'import' in binding
}

/** @internal */
export function isExportBinding(binding: Binding): binding is ExportBinding {
    return 'export' in binding
}

/** @internal */
export function isReExportBinding(binding: Binding): binding is ExportBinding & { from: string } {
    return 'export' in binding && typeof binding.from === 'string'
}

/** @internal */
export function isImportAllBinding(binding: Binding): binding is ImportAllBinding {
    return 'importAllFrom' in binding
}

/** @internal */
export function isExportAllBinding(binding: Binding): binding is ExportAllBinding {
    return 'exportAllFrom' in binding
}

/** @internal */
export function hasFromField<T extends Binding>(binding: T): binding is T & { from: string } {
    return 'from' in binding && typeof binding.from === 'string'
}
