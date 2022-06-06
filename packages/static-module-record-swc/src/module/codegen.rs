use super::{config::Template, StaticModuleRecordTransformer};
use crate::utils::*;
use swc_common::{util::take::Take, DUMMY_SP};
use swc_plugin::ast::*;

impl StaticModuleRecordTransformer {
    pub fn codegen(&self, stmt: Vec<Stmt>, transformer: &StaticModuleRecordTransformer) -> Module {
        let expr = self.new_static_module_record(stmt, transformer);
        Module {
            body: match &self.config.template {
                Template::ExportDefault => export_default_expr(expr),
                Template::Callback {
                    callback_name,
                    first_arg,
                } => callback(
                    Ident::new(callback_name.clone().into(), DUMMY_SP),
                    Expr::Lit(first_arg.clone().into()),
                    expr,
                ),
                Template::CallbackInfer { callback_name, cwd } => callback(
                    Ident::new(callback_name.clone().into(), DUMMY_SP),
                    Expr::Lit(relative(self.file_name.as_ref().unwrap(), cwd).into()),
                    expr,
                ),
            },
            ..Module::dummy()
        }
    }
    fn new_static_module_record(
        &self,
        stmt: Vec<Stmt>,
        transformer: &StaticModuleRecordTransformer,
    ) -> Expr {
        let init_fn = Function {
            is_async: self.uses_top_level_await,
            body: Some(BlockStmt {
                span: DUMMY_SP,
                stmts: stmt,
            }),
            params: {
                let emit_import_meta = self.uses_import_meta || self.uses_dynamic_import;
                let emit_dynamic_import = self.uses_dynamic_import;

                let mut result = vec![param(transformer.module_env_record_ident.clone())];
                if emit_import_meta {
                    result.push(param(transformer.import_meta_ident.clone()));
                }
                if emit_dynamic_import {
                    result.push(param(transformer.dynamic_import_ident.clone()));
                }
                result
            },
            ..Function::dummy()
        };

        let mut props = vec![];

        if !self.bindings.is_empty() {
            props.push(key_value(
                "bindings".into(),
                ArrayLit {
                    span: DUMMY_SP,
                    elems: (&self.bindings)
                        .iter()
                        .map(|binding| {
                            Some(ExprOrSpread {
                                expr: Box::new(binding.to_object_lit().into()),
                                spread: None,
                            })
                        })
                        .collect(),
                }
                .into(),
            ));
        }

        if self.uses_import_meta {
            props.push(key_value(
                "needsImportMeta".into(),
                Bool {
                    span: DUMMY_SP,
                    value: self.uses_import_meta,
                }
                .into(),
            ));
        }

        props.push(key_value(
            "initialize".into(),
            FnExpr {
                ident: None,
                function: init_fn,
            }
            .into(),
        ));

        ObjectLit {
            span: DUMMY_SP,
            props,
        }
        .into()
    }
}

fn export_default_expr(expr: Expr) -> Vec<ModuleItem> {
    let export_default_expr: ModuleDecl = ExportDefaultExpr {
        span: DUMMY_SP,
        expr: Box::new(expr),
    }
    .into();
    vec![export_default_expr.into()]
}

fn callback(callee: Ident, first_arg: Expr, second_arg: Expr) -> Vec<ModuleItem> {
    let call = CallExpr {
        callee: Callee::Expr(Box::new(callee.into())),
        args: vec![
            ExprOrSpread {
                expr: Box::new(first_arg),
                spread: None,
            },
            ExprOrSpread {
                expr: Box::new(second_arg),
                spread: None,
            },
        ],
        ..CallExpr::dummy()
    };
    vec![ModuleItem::Stmt(
        ExprStmt {
            expr: Box::new(call.into()),
            span: DUMMY_SP,
        }
        .into(),
    )]
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
