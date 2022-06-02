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
    bindings: Vec<Binding>,
    local_modifiable_bindings: Vec<LocalModifiableBinding>,
    pub config: Config,
}

impl StaticModuleRecordTransformer {
    pub fn new(config: Config) -> Self {
        Self {
            uses_import_meta: false,
            uses_top_level_await: false,
            bindings: Vec::new(),
            local_modifiable_bindings: Vec::new(),
            config,
        }
    }
}
