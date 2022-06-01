use std::fs::{read_to_string, write};
use std::{path::PathBuf, rc::Rc};
use swc_common::comments::SingleThreadedComments;
use swc_ecma_parser::Syntax;
use swc_ecma_transforms_testing::{test, Tester};

use crate::module::config::{Config, Template};
use crate::StaticModuleRecordTransformer;

#[testing::fixture("tests/fixture/**/*.js")]
fn test(input: PathBuf) {
    let output = calc_output_path(&input);
    let file = read_to_string(&input).unwrap();
    let config = parse_config(&file);

    Tester::run(|tester| {
        let actual = tester.apply_transform(
            StaticModuleRecordTransformer::new(config.unwrap_or(default_config())),
            "input.js",
            Syntax::Es(Default::default()),
            file.as_str(),
        )?;
        let result = tester.print(&actual, &Rc::new(SingleThreadedComments::default()));
        // TODO: why comments are missing?
        write(&output, format!("// @ts-nocheck\n{}", result)).unwrap();
        Ok(())
    })
}

fn parse_config(file: &String) -> Option<Config> {
    if file.starts_with("/// ") {
        let first_line = file.lines().next()?;
        let config = serde_json::from_str::<Config>(&first_line[4..]).unwrap();
        Some(config)
    } else {
        None
    }
}
fn default_config() -> Config {
    Config {
        global_static_module_constructor: false,
        template: Template::ExportDefault,
    }
}

fn calc_output_path(path: &PathBuf) -> PathBuf {
    let mut output = path.clone();
    output.pop();
    output.pop();
    output.push("snapshot");
    output.push(path.file_name().unwrap());
    output
}
