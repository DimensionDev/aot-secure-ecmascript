use module::StaticModuleRecordTransformer;
use script::ErrorTransformer;
use swc_plugin::{ast::*, plugin_transform, TransformPluginProgramMetadata};

mod binding_descriptor;
mod module;
mod script;
mod utils;

#[cfg(test)]
mod test;

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    match &program {
        Program::Script(script) => {
            script::emit(&script);
            program.fold_with(&mut ErrorTransformer {})
        }
        Program::Module(_) => program.fold_with(&mut StaticModuleRecordTransformer::new()),
    }
}
