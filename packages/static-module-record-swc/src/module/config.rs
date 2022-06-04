use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
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

#[derive(Serialize, Deserialize, Debug, Copy, Clone)]
#[serde(tag = "type")]
pub enum Template {
    /// export default new StaticModuleRecord(...)
    ///
    #[serde(rename = "ExportDefault")]
    ExportDefault,
}
