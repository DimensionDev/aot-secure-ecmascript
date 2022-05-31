use std::fs::{read_to_string, write};
use std::{path::PathBuf, rc::Rc};
use swc_common::comments::SingleThreadedComments;
use swc_ecma_parser::Syntax;
use swc_ecma_transforms_testing::{test, Tester};

use crate::StaticModuleRecordTransformer;


#[testing::fixture("tests/fixture/**/*.js")]
fn test(input: PathBuf) {
    let output = calc_output_path(&input);

    Tester::run(|tester| {
        let actual = tester.apply_transform(
            StaticModuleRecordTransformer::new(),
            "input.js",
            Syntax::Es(Default::default()),
            read_to_string(&input).unwrap().as_str(),
        )?;
        let result = tester.print(&actual, &Rc::new(SingleThreadedComments::default()));
        // TODO: why comments are missing?
        write(&output, format!("// @ts-nocheck\n{}", result)).unwrap();
        Ok(())
    })
}

fn calc_output_path(path: &PathBuf) -> PathBuf {
    let mut output = path.clone();
    output.pop();
    output.pop();
    output.push("snapshot");
    output.push(path.file_name().unwrap());
    output
}
