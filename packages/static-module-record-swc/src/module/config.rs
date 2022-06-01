use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(default)]
pub struct Config {
    /// The template of code generation
    pub template: Template,

    #[serde(rename = "noGlobalStaticModuleRecord")]
    /// When there is no global StaticModuleRecord constructor available,
    /// switch on this option, and it will generate code like this so you can provide your local implementation.
    /// ```js
    /// (StaticModuleRecord) => new StaticModuleRecord(...)
    /// ```
    pub global_static_module_constructor: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            template: Template::ExportDefault,
            global_static_module_constructor: true,
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
