/// Describes the import/export bindings of a JS module.
mod binding_descriptor;
/// Code generation for VirtualModuleRecord.
mod codegen;
pub mod config;
/// Scan the binding_descriptor inside a JS module.
mod scanner;
/// Transform bindings into VirtualModuleRecord.
mod transformer;

use std::collections::HashMap;

use self::{binding_descriptor::*, config::Config};
use swc_common::{Mark, SyntaxContext};
use swc_plugin::{
    ast::{Id, Ident, Str},
    utils::private_ident,
};

/// Convert code into VirtualModuleRecord
pub struct VirtualModuleRecordTransformer {
    uses_import_meta: bool,
    uses_top_level_await: bool,
    uses_dynamic_import: bool,
    uses_global_lookup: bool,

    bindings: Vec<Binding>,
    imported_ident: HashMap<Id, (ModuleBinding, Str)>,
    local_resolved_bindings: Vec<LiveExportTracingBinding>,
    unresolved: SyntaxContext,

    module_env_record_ident: Ident,
    import_context_ident: Ident,
    global_this_ident: Ident,

    may_include_implicit_arguments: bool,

    pub config: Config,
    pub file_name: Option<String>,
}

impl VirtualModuleRecordTransformer {
    pub fn new(config: Config, file_name: Option<String>, unresolved_mark: Mark) -> Self {
        Self {
            uses_import_meta: false,
            uses_top_level_await: false,
            uses_dynamic_import: false,
            uses_global_lookup: false,
            may_include_implicit_arguments: false,
            bindings: Vec::new(),
            local_resolved_bindings: Vec::new(),
            module_env_record_ident: private_ident!("__"),
            import_context_ident: private_ident!("context"),
            global_this_ident: private_ident!("_"),
            config,
            file_name,
            unresolved: SyntaxContext::empty().apply_mark(unresolved_mark),
            imported_ident: HashMap::new(),
        }
    }
}
