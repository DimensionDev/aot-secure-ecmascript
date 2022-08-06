use std::env::current_dir;
use std::fs::{read_to_string, write};
use std::{path::PathBuf, rc::Rc};
use swc_ecma_parser::Syntax;
use swc_ecma_transforms::{hygiene, resolver};
use swc_ecma_transforms_testing::{test, Tester};
use swc_core::common::{chain, Mark, comments::SingleThreadedComments};

use crate::module::config::{Config, Template};
use crate::VirtualModuleRecordTransformer;

#[testing::fixture("tests/fixture/**/*.js")]
fn test(input: PathBuf) {
    let output = calc_output_path(&input);
    let file = read_to_string(&input).unwrap();
    let config = parse_config(&file);

    Tester::run(|tester| {
        let input_url = format!("{}", input.as_path().display()).replace("\\\\?\\", "");
        let unresolved_mark = Mark::new();
        let top_level_mark = Mark::new();
        let actual = tester.apply_transform(
            chain!(
                resolver(unresolved_mark, top_level_mark, false),
                VirtualModuleRecordTransformer::new(
                    config.unwrap_or_default(),
                    Some(input_url),
                    unresolved_mark
                ),
                hygiene()
            ),
            "input.js",
            Syntax::Es(Default::default()),
            file.as_str(),
        )?;
        let result = tester.print(&actual, &Rc::new(SingleThreadedComments::default()));
        // TODO: why comments are missing?
        write(&output, result).unwrap();
        Ok(())
    })
}

fn parse_config(file: &String) -> Option<Config> {
    if file.starts_with("/// ") {
        let first_line = file.lines().next()?;
        let mut config = serde_json::from_str::<Config>(&first_line[4..]).unwrap();
        if let Template::CallbackInfer {
            callback_name,
            cwd: _,
        } = config.template
        {
            config.template = Template::CallbackInfer {
                callback_name,
                cwd: format!("{}", current_dir().unwrap().as_path().display()),
            };
        }
        Some(config)
    } else {
        None
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
