use swc_common::{errors::Level, MultiSpan, DUMMY_SP};
use swc_plugin::ast::*;

use crate::utils::str_lit;

pub struct ErrorTransformer;

// TODO: does it really work?
pub fn emit(script: &Script) {
    let mut span = MultiSpan::new();
    span.push_span_label(script.span, "Here".into());
    swc_plugin::errors::HANDLER.inner.get().unwrap().emit(
        &span,
        "StaticModuleRecord transformer must run in the Module mode.",
        Level::Error,
    );
}

impl Fold for ErrorTransformer {
    /// Convert code into
    /// ```js
    /// throw "error"
    /// ```
    fn fold_script(&mut self, n: Script) -> Script {
        let error = "StaticModuleRecord transformer must run in the Module mode.";
        Script {
            body: vec![ThrowStmt {
                span: DUMMY_SP,
                arg: Box::new(str_lit(error.into()).into()),
            }
            .into()],
            ..n
        }
    }
}
