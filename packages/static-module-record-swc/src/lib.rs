#![allow(clippy::not_unsafe_ptr_arg_deref)]

use module::{config::Config, VirtualModuleRecordTransformer};
use script::ErrorTransformer;
use swc_common::DUMMY_SP;
use swc_plugin::{
    ast::*,
    metadata::{TransformPluginMetadataContextKind, TransformPluginProgramMetadata},
    plugin_transform,
};
use utils::emit_error;

mod module;
mod script;
mod utils;

#[cfg(test)]
mod test;

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Config>(
        &metadata
            .get_transform_plugin_config()
            .unwrap_or("".to_string()),
    );
    let filename = metadata.get_context(&TransformPluginMetadataContextKind::Filename);
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
            Program::Module(_) => {
                program.fold_with(&mut VirtualModuleRecordTransformer::new(config, filename))
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
