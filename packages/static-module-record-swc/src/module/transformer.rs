use swc_common::DUMMY_SP;
use swc_plugin::ast::*;

use crate::utils::*;

use super::StaticModuleRecordTransformer;

impl StaticModuleRecordTransformer {
    pub fn transform_module(&mut self, module: Module) -> Vec<Stmt> {
        let module = Module {
            body: (&module.body)
                .into_iter()
                .flat_map(|item| match item {
                    ModuleItem::ModuleDecl(_) => vec![],
                    ModuleItem::Stmt(_) => vec![],
                })
                .collect(),
            shebang: None,
            span: DUMMY_SP,
        };
        let module = module.fold_children_with(self);
        module.body.into_iter().filter_map(|x| x.stmt()).collect()
    }
}

impl Fold for StaticModuleRecordTransformer {
    fn fold_callee(&mut self, n: Callee) -> Callee {
        if n.is_import() {
            Callee::Expr(Box::new(dynamic_import().into()))
        } else {
            n.fold_children_with(self)
        }
    }
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.Fold.html
    fn fold_expr(&mut self, n: Expr) -> Expr {
        match n {
            Expr::MetaProp(meta) if meta.kind == MetaPropKind::ImportMeta => {
                self.uses_import_meta = true;
                import_meta().into()
            }
            _ => n.fold_children_with(self),
        }
    }
    fn fold_module(&mut self, n: Module) -> Module {
        self.transformer(n)
    }
}
