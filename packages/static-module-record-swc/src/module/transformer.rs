use swc_common::DUMMY_SP;
use swc_plugin::ast::*;

use crate::utils::*;

use super::{codegen::assign_env_rec, StaticModuleRecordTransformer};

impl StaticModuleRecordTransformer {
    pub fn transform_module(&mut self, module: Module) -> Vec<Stmt> {
        let module = Module {
            body: module
                .body
                .into_iter()
                .filter_map(|item| -> Option<Stmt> {
                    match item {
                        ModuleItem::ModuleDecl(node) => match node {
                            ModuleDecl::Import(_) => None,
                            ModuleDecl::ExportDecl(_) => todo!(),
                            ModuleDecl::ExportNamed(_) => todo!(),
                            ModuleDecl::ExportDefaultDecl(decl) => match decl.decl {
                                DefaultDecl::Class(class) => Some(Stmt::Expr(ExprStmt {
                                    span: DUMMY_SP,
                                    expr: Box::new(assign_env_rec(
                                        ident_default().into(),
                                        Box::new(class.into()),
                                    )),
                                })),
                                DefaultDecl::Fn(f) => Some(Stmt::Expr(ExprStmt {
                                    span: DUMMY_SP,
                                    expr: Box::new(assign_env_rec(
                                        ident_default().into(),
                                        Box::new(f.into()),
                                    )),
                                })),
                                DefaultDecl::TsInterfaceDecl(_) => unimplemented!(),
                            },
                            // export default expr => env.default = expr
                            ModuleDecl::ExportDefaultExpr(node) => Some(Stmt::Expr(ExprStmt {
                                span: DUMMY_SP,
                                expr: Box::new(assign_env_rec(ident_default().into(), node.expr)),
                            })),
                            ModuleDecl::ExportAll(_) => None,
                            ModuleDecl::TsImportEquals(_) => unimplemented!(),
                            ModuleDecl::TsExportAssignment(_) => unimplemented!(),
                            ModuleDecl::TsNamespaceExport(_) => unimplemented!(),
                        },
                        ModuleItem::Stmt(node) => node.fold_children_with(self).into(),
                    }
                })
                .map(|f| f.into())
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
