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
                .flat_map(|item| -> Vec<Stmt> {
                    match item {
                        ModuleItem::ModuleDecl(node) => match node {
                            // we have environment record!
                            ModuleDecl::Import(_) => vec![],
                            ModuleDecl::ExportDecl(decl) => match decl.decl {
                                Decl::Class(class) => {
                                    let class = class.fold_children_with(self);
                                    vec![Stmt::Expr(ExprStmt {
                                        span: DUMMY_SP,
                                        expr: Box::new(assign_env_rec(
                                            class.ident.clone().into(),
                                            Box::new(
                                                ClassExpr {
                                                    ident: Some(class.ident),
                                                    class: class.class,
                                                }
                                                .into(),
                                            ),
                                        )),
                                    })]
                                }
                                Decl::Fn(f) => {
                                    let f = f.fold_children_with(self);
                                    vec![Stmt::Expr(ExprStmt {
                                        span: DUMMY_SP,
                                        expr: Box::new(assign_env_rec(
                                            f.ident.clone().into(),
                                            Box::new(
                                                FnExpr {
                                                    ident: Some(f.ident),
                                                    function: f.function,
                                                }
                                                .into(),
                                            ),
                                        )),
                                    })]
                                }
                                Decl::Var(decl) => {
                                    let decl = decl.fold_children_with(self);
                                    let mut assign_exprs = vec![];
                                    for item in &decl.decls {
                                        self.live_export_pat(&item.name, &mut assign_exprs);
                                    }
                                    let mut result = vec![Stmt::Decl(decl.into())];
                                    for expr in assign_exprs {
                                        result.push(Stmt::Expr(ExprStmt {
                                            span: DUMMY_SP,
                                            expr: Box::new(expr),
                                        }))
                                    }
                                    result
                                }
                                Decl::TsInterface(_) => unimplemented!(),
                                Decl::TsTypeAlias(_) => unimplemented!(),
                                Decl::TsEnum(_) => unimplemented!(),
                                Decl::TsModule(_) => unimplemented!(),
                            },
                            // export { x, y as z } from 'path'
                            // export { x }
                            // we totally omit this, because it will be handled in the definition site (the referenced value may be in the TDZ).
                            ModuleDecl::ExportNamed(_) => vec![],
                            ModuleDecl::ExportDefaultDecl(decl) => match decl.decl {
                                DefaultDecl::Class(class) => vec![Stmt::Expr(ExprStmt {
                                    span: DUMMY_SP,
                                    expr: Box::new(assign_env_rec(
                                        ident_default().into(),
                                        Box::new(class.fold_children_with(self).into()),
                                    )),
                                })],
                                DefaultDecl::Fn(f) => vec![Stmt::Expr(ExprStmt {
                                    span: DUMMY_SP,
                                    expr: Box::new(assign_env_rec(
                                        ident_default().into(),
                                        Box::new(f.fold_children_with(self).into()),
                                    )),
                                })],
                                DefaultDecl::TsInterfaceDecl(_) => unimplemented!(),
                            },
                            // export default expr => env.default = expr
                            ModuleDecl::ExportDefaultExpr(node) => vec![Stmt::Expr(ExprStmt {
                                span: DUMMY_SP,
                                expr: Box::new(assign_env_rec(
                                    ident_default().into(),
                                    node.expr.fold_children_with(self),
                                )),
                            })],
                            // export * from './foo' => No emit
                            ModuleDecl::ExportAll(_) => vec![],
                            ModuleDecl::TsImportEquals(_) => unimplemented!(),
                            ModuleDecl::TsExportAssignment(_) => unimplemented!(),
                            ModuleDecl::TsNamespaceExport(_) => unimplemented!(),
                        },
                        ModuleItem::Stmt(node) => vec![node.fold_children_with(self).into()],
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
    fn live_export_pat(&self, pat: &Pat, extra: &mut Vec<Expr>) {
        match pat {
            Pat::Ident(ident) => self.trace_live_export(&ident.id, extra),
            Pat::Array(arr) => {
                for item in &arr.elems {
                    if let Some(item) = item {
                        self.live_export_pat(item, extra);
                    }
                }
            }
            Pat::Rest(rest) => self.live_export_pat(&rest.arg, extra),
            Pat::Object(obj) => {
                for prop in &obj.props {
                    match prop {
                        ObjectPatProp::Assign(assign) => self.trace_live_export(&assign.key, extra),
                        ObjectPatProp::KeyValue(kv) => self.live_export_pat(&kv.value, extra),
                        ObjectPatProp::Rest(rest) => self.live_export_pat(&rest.arg, extra),
                    }
                }
            }
            Pat::Assign(assign) => self.live_export_pat(&assign.left, extra),
            Pat::Invalid(_) => unreachable!(),
            // Only for for-in / for-of loops. I need a code example to handle this...
            Pat::Expr(_) => todo!(),
        }
    }
    fn trace_live_export(&self, local_ident: &Ident, extra: &mut Vec<Expr>) {
        for modifying_export in (&self.local_modifiable_bindings)
            .into_iter()
            .filter(|x| x.local_ident.to_id() == local_ident.to_id())
        {
            match &modifying_export.export {
                ModuleExportName::Ident(ident) => {
                    extra.push(assign_env_rec(
                        MemberProp::Ident(ident.clone().into()),
                        Box::new(local_ident.clone().into()),
                    ));
                }
                ModuleExportName::Str(str) => extra.push(assign_env_rec(
                    MemberProp::Computed(ComputedPropName {
                        span: DUMMY_SP,
                        expr: Box::new(str.clone().into()),
                    }),
                    Box::new(local_ident.clone().into()),
                )),
            }
        }
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
