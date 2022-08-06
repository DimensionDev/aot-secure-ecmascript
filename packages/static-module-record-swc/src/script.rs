use swc_core::ast::*;
use swc_core::common::DUMMY_SP;
use swc_core::visit::*;

use crate::utils::str_lit;

pub struct ErrorTransformer {
    pub msg: String,
}

fn err(msg: &str) -> ThrowStmt {
    ThrowStmt {
        span: DUMMY_SP,
        arg: Box::new(str_lit(msg.into())),
    }
}

impl Fold for ErrorTransformer {
    fn fold_module(&mut self, module: Module) -> Module {
        Module {
            body: vec![ModuleItem::Stmt(err(&self.msg).into())],
            ..module
        }
    }
    /// Convert code into
    /// ```js
    /// throw "error"
    /// ```
    fn fold_script(&mut self, n: Script) -> Script {
        Script {
            body: vec![err(&self.msg).into()],
            ..n
        }
    }
}
