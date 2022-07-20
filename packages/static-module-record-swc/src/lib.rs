#![allow(clippy::not_unsafe_ptr_arg_deref)]

use module::{
    config::{Config, TransformContext},
    VirtualModuleRecordTransformer,
};
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
    let context = serde_json::from_str::<TransformContext>(&metadata.transform_context);
    match config {
        Ok(config) => match &program {
            Program::Script(script) => {
                emit_error(
                    script.span,
                    "VirtualModuleRecord transformer must run in the Module mode.",
                );
                program.fold_with(&mut ErrorTransformer {
                    msg: "VirtualModuleRecord transformer must run in the Module mode.".to_string(),
                })
            }
            Program::Module(_) => program.fold_with(&mut VirtualModuleRecordTransformer::new(
                config,
                context.map(|x| x.file_name).ok(),
            )),
        },
        Err(err) => {
            emit_error(DUMMY_SP, &format!("{}", err));
            program.fold_with(&mut ErrorTransformer {
                msg: format!("{}", err),
            })
        }
    }
}
