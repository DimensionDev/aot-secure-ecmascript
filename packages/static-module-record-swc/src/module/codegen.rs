use super::StaticModuleRecordTransformer;
use crate::utils::*;
use swc_common::{util::take::Take, DUMMY_SP};
use swc_plugin::ast::*;

impl StaticModuleRecordTransformer {
    pub fn codegen(&self, stmt: Vec<Stmt>, transformer: &StaticModuleRecordTransformer) -> Module {
        let new_expr = self.local_constructor_wrapper(self.new_static_module_record(stmt, transformer));
        Module {
            body: export_default_expr(new_expr),
            ..Module::dummy()
        }
    }
    fn local_constructor_wrapper(&self, expr: Expr) -> Expr {
        if self.config.global_static_module_constructor {
            expr
        } else {
            ArrowExpr {
                params: vec![static_module_record().into()],
                body: BlockStmtOrExpr::Expr(Box::new(expr)),
                ..ArrowExpr::dummy()
            }
            .into()
        }
    }
    fn new_static_module_record(&self, stmt: Vec<Stmt>, transformer: &StaticModuleRecordTransformer) -> Expr {
        let init_fn = Function {
            is_async: self.uses_top_level_await,
            body: Some(BlockStmt {
                span: DUMMY_SP,
                stmts: stmt,
            }),
            params: vec![
                param(transformer.module_env_record_ident.clone()),
                param(transformer.import_meta_ident.clone()),
                param(transformer.dynamic_import_ident.clone()),
            ],
            ..Function::dummy()
        };

        let third_party_module = ObjectLit {
            span: DUMMY_SP,
            props: vec![
                key_value(
                    "bindings".into(),
                    ArrayLit {
                        span: DUMMY_SP,
                        elems: (&self.bindings)
                            .into_iter()
                            .map(|binding| {
                                Some(ExprOrSpread {
                                    expr: Box::new(binding.to_object_lit().into()),
                                    spread: None,
                                })
                            })
                            .collect(),
                    }
                    .into(),
                ),
                key_value(
                    "needsImportMeta".into(),
                    Bool {
                        span: DUMMY_SP,
                        value: self.uses_import_meta,
                    }
                    .into(),
                ),
                key_value(
                    "initialize".into(),
                    FnExpr {
                        ident: None,
                        function: init_fn,
                    }
                    .into(),
                ),
            ],
        };
        NewExpr {
            callee: Box::new(static_module_record().into()),
            args: Some(vec![ExprOrSpread {
                expr: Box::new(third_party_module.into()),
                spread: None,
            }]),
            ..NewExpr::dummy()
        }
        .into()
    }
}
fn export_default_expr(new_expr: Expr) -> Vec<ModuleItem> {
    let export_default_expr: ModuleDecl = ExportDefaultExpr {
        span: DUMMY_SP,
        expr: Box::new(new_expr),
    }
    .into();
    vec![export_default_expr.into()]
}

pub fn prop_access(obj: Ident, prop: Ident) -> Expr {
    MemberExpr {
        obj: Box::new(obj.into()),
        prop: prop.into(),
        span: DUMMY_SP,
    }
    .into()
}
pub fn assign_prop(obj: Ident, assign_to: MemberProp, expr: Box<Expr>) -> Expr {
    AssignExpr {
        left: PatOrExpr::Expr(Box::new(
            MemberExpr {
                obj: Box::new(obj.into()),
                prop: assign_to,
                span: DUMMY_SP,
            }
            .into(),
        )),
        op: op!("="),
        right: expr,
        span: DUMMY_SP,
    }
    .into()
}
