use module::{StaticModuleRecordTransformer, config::Config};
use script::ErrorTransformer;
use swc_plugin::{ast::*, plugin_transform, TransformPluginProgramMetadata};

mod module;
mod script;
mod utils;

#[cfg(test)]
mod test;

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Config>(&metadata.plugin_config).unwrap();
    match &program {
        Program::Script(script) => {
            script::emit(&script);
            program.fold_with(&mut ErrorTransformer {})
        }
        Program::Module(_) => program.fold_with(&mut StaticModuleRecordTransformer::new(config)),
    }
}
