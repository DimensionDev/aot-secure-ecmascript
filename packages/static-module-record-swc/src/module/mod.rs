/// Describes the import/export bindings of a JS module.
mod binding_descriptor;
/// Code generation for StaticModuleRecord.
mod codegen;
pub mod config;
/// Scan the binding_descriptor inside a JS module.
mod scanner;
/// Transform bindings into StaticModuleRecord.
mod transformer;

use self::{binding_descriptor::*, config::Config};
use std::collections::HashSet;
use swc_common::DUMMY_SP;
use swc_plugin::ast::{Id, Ident};

/// Convert code into
/// ```js
/// export default new StaticModuleRecord({
///     bindings: ...,
///     needsImportMeta: ...,
///     [async?] initialize(env, importMeta, dynamicImport) {}
/// })
/// ```
pub struct StaticModuleRecordTransformer {
    uses_import_meta: bool,
    uses_top_level_await: bool,
    uses_dynamic_import: bool,
    bindings: Vec<Binding>,
    local_modifiable_bindings: Vec<LocalModifiableBinding>,
    local_ident: HashSet<Id>,
    module_env_record_ident: Ident,
    import_meta_ident: Ident,
    dynamic_import_ident: Ident,
    pub config: Config,
}

impl StaticModuleRecordTransformer {
    pub fn new(config: Config) -> Self {
        Self {
            uses_import_meta: false,
            uses_top_level_await: false,
            uses_dynamic_import: false,
            bindings: Vec::new(),
            local_modifiable_bindings: Vec::new(),
            local_ident: HashSet::new(),
            module_env_record_ident: Ident::new("_".into(), DUMMY_SP),
            import_meta_ident: Ident::new("import_meta".into(), DUMMY_SP),
            dynamic_import_ident: Ident::new("_import".into(), DUMMY_SP),
            config,
        }
    }
}
