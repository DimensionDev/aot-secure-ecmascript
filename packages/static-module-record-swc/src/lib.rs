use module::{config::Config, StaticModuleRecordTransformer};
use script::ErrorTransformer;
use swc_common::DUMMY_SP;
use swc_plugin::{ast::*, plugin_transform, TransformPluginProgramMetadata};
use utils::emit_error;

mod module;
mod script;
mod utils;

#[cfg(test)]
mod test;

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Config>(&metadata.plugin_config);
    match config {
        Ok(config) => match &program {
            Program::Script(script) => {
                emit_error(
                    script.span,
                    &format!("StaticModuleRecord transformer must run in the Module mode."),
                );
                program.fold_with(&mut ErrorTransformer {
                    msg: format!("StaticModuleRecord transformer must run in the Module mode."),
                })
            }
            Program::Module(_) => {
                program.fold_with(&mut StaticModuleRecordTransformer::new(config))
            }
        },
        Err(err) => {
            emit_error(DUMMY_SP, &format!("{}", err));
            program.fold_with(&mut ErrorTransformer {
                msg: format!("{}", err),
            })
        }
    }
}
