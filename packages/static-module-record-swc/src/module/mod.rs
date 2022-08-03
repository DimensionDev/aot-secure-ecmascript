/// Describes the import/export bindings of a JS module.
mod binding_descriptor;
/// Code generation for VirtualModuleRecord.
mod codegen;
pub mod config;
/// Scan the binding_descriptor inside a JS module.
mod scanner;
/// Transform bindings into VirtualModuleRecord.
mod transformer;

use self::{binding_descriptor::*, config::Config};
use std::collections::HashSet;
use swc_plugin::{
    ast::{Id, Ident},
    utils::private_ident,
};

/// Convert code into VirtualModuleRecord
pub struct VirtualModuleRecordTransformer {
    uses_import_meta: bool,
    uses_top_level_await: bool,
    uses_dynamic_import: bool,

    bindings: Vec<Binding>,
    local_modifiable_bindings: Vec<LocalModifiableBinding>,
    local_ident: HashSet<Id>,

    module_env_record_ident: Ident,
    import_context_ident: Ident,

    may_include_implicit_arguments: bool,

    pub config: Config,
    pub file_name: Option<String>,
}

impl VirtualModuleRecordTransformer {
    pub fn new(config: Config, file_name: Option<String>) -> Self {
        Self {
            uses_import_meta: false,
            uses_top_level_await: false,
            uses_dynamic_import: false,
            may_include_implicit_arguments: false,
            bindings: Vec::new(),
            local_modifiable_bindings: Vec::new(),
            local_ident: HashSet::new(),
            module_env_record_ident: private_ident!("_"),
            import_context_ident: private_ident!("context"),
            config,
            file_name,
        }
    }
}
