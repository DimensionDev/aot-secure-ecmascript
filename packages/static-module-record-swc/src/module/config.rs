use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(default)]
pub struct Config {
    /// The template of code generation
    pub template: Template,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            template: Template::ExportDefault,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum Template {
    /// export default { ... }
    #[serde(rename = "export-default")]
    ExportDefault,

    /// callback_name("first_arg", { ... })
    #[serde(rename = "callback")]
    Callback {
        #[serde(rename = "callback")]
        callback_name: String,
        #[serde(rename = "firstArg")]
        first_arg: String,
    },
    /// callback_name("/path_from/cwd", { ... })
    #[serde(rename = "callback-cwd")]
    CallbackInfer {
        #[serde(rename = "callback")]
        callback_name: String,
        #[serde(rename = "cwd")]
        cwd: String,
    },

    /// "use strict"; ({ ... })
    #[serde(rename = "eval")]
    Eval,
}
