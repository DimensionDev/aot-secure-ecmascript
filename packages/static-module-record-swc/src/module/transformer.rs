use swc_common::DUMMY_SP;
use swc_plugin::ast::*;

use crate::utils::*;

use super::{
    binding_descriptor::{Binding, ModuleBinding},
    codegen::{assign_env_rec, read_env_rec},
    StaticModuleRecordTransformer,
};

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
                                Decl::Class(class) => self.fold_top_level_decl(class.into()),
                                Decl::Fn(f) => self.fold_top_level_decl(f.into()),
                                Decl::Var(decl) => self.fold_top_level_decl(decl.into()),
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
                                DefaultDecl::Class(class) => {
                                    if let Some(name) = &class.ident {
                                        self.fold_top_level_decl(
                                            ClassDecl {
                                                class: class.class,
                                                declare: false,
                                                ident: name.clone(),
                                            }
                                            .into(),
                                        )
                                    } else {
                                        vec![Stmt::Expr(ExprStmt {
                                            span: DUMMY_SP,
                                            expr: Box::new(assign_env_rec(
                                                ident_default().into(),
                                                Box::new(class.fold_children_with(self).into()),
                                            )),
                                        })]
                                    }
                                }
                                DefaultDecl::Fn(f) => {
                                    if let Some(name) = &f.ident {
                                        self.fold_top_level_decl(
                                            FnDecl {
                                                declare: false,
                                                ident: name.clone(),
                                                function: f.function,
                                            }
                                            .into(),
                                        )
                                    } else {
                                        vec![Stmt::Expr(ExprStmt {
                                            span: DUMMY_SP,
                                            expr: Box::new(assign_env_rec(
                                                ident_default().into(),
                                                Box::new(f.fold_children_with(self).into()),
                                            )),
                                        })]
                                    }
                                }
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
                        ModuleItem::Stmt(node) => match node {
                            Stmt::For(_) => todo!(),
                            Stmt::ForIn(_) => todo!(),
                            Stmt::ForOf(_) => todo!(),
                            Stmt::Decl(decl) => self.fold_top_level_decl(decl),
                            _ => vec![node.fold_children_with(self)],
                        },
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
    fn trace_live_export_pat(&self, pat: &Pat, extra: &mut Vec<Expr>) {
        match pat {
            Pat::Ident(ident) => self.trace_live_export_ident(&ident.id, extra),
            Pat::Array(arr) => {
                for item in &arr.elems {
                    if let Some(item) = item {
                        self.trace_live_export_pat(item, extra);
                    }
                }
            }
            Pat::Rest(rest) => self.trace_live_export_pat(&rest.arg, extra),
            Pat::Object(obj) => {
                for prop in &obj.props {
                    match prop {
                        ObjectPatProp::Assign(assign) => {
                            self.trace_live_export_ident(&assign.key, extra)
                        }
                        ObjectPatProp::KeyValue(kv) => self.trace_live_export_pat(&kv.value, extra),
                        ObjectPatProp::Rest(rest) => self.trace_live_export_pat(&rest.arg, extra),
                    }
                }
            }
            Pat::Assign(assign) => self.trace_live_export_pat(&assign.left, extra),
            Pat::Invalid(_) => unreachable!(),
            // Only for for-in / for-of loops. I need a code example to handle this...
            Pat::Expr(_) => todo!(),
        }
    }
    fn trace_live_export_ident(&self, local_ident: &Ident, extra: &mut Vec<Expr>) {
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
    fn fold_top_level_decl(&mut self, decl: Decl) -> Vec<Stmt> {
        let mut assign_exprs = vec![];
        match &decl {
            Decl::Class(class) => self.trace_live_export_ident(&class.ident, &mut assign_exprs),
            Decl::Fn(f) => self.trace_live_export_ident(&f.ident, &mut assign_exprs),
            Decl::Var(decl) => {
                for item in &decl.decls {
                    self.trace_live_export_pat(&item.name, &mut assign_exprs);
                }
            }
            Decl::TsInterface(_) => unimplemented!(),
            Decl::TsTypeAlias(_) => unimplemented!(),
            Decl::TsEnum(_) => unimplemented!(),
            Decl::TsModule(_) => unimplemented!(),
        };
        std::iter::once(decl.fold_children_with(self).into())
            .chain(assign_exprs.into_iter().map(|x| {
                Stmt::Expr(ExprStmt {
                    span: DUMMY_SP,
                    expr: Box::new(x),
                })
            }))
            .collect()
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
            Expr::Update(expr) => {
                if let Some(id) = (&expr.arg).as_ident() {
                    let mut tracing = vec![];
                    self.trace_live_export_ident(&id, &mut tracing);
                    if tracing.len() == 0 {
                        expr.fold_children_with(self).into()
                    } else {
                        tracing.insert(0, expr.into());
                        SeqExpr {
                            exprs: tracing.into_iter().map(|x| Box::new(x)).collect(),
                            span: DUMMY_SP,
                        }
                        .into()
                    }
                } else {
                    expr.fold_children_with(self).into()
                }
            }
            // id += ...
            Expr::Assign(expr) => {
                let mut tracing = vec![];
                match &expr.left {
                    PatOrExpr::Expr(expr) => {
                        if let Some(id) = expr.as_ident() {
                            self.trace_live_export_ident(id, &mut tracing);
                        }
                    }
                    PatOrExpr::Pat(pat) => self.trace_live_export_pat(pat, &mut tracing),
                };

                if tracing.len() == 0 {
                    expr.fold_children_with(self).into()
                } else {
                    tracing.insert(0, expr.into());
                    let completion_value = ArrayLit {
                        elems: tracing
                            .into_iter()
                            .map(|x| {
                                Some(ExprOrSpread {
                                    expr: Box::new(x),
                                    spread: None,
                                })
                            })
                            .collect(),
                        span: DUMMY_SP,
                    };
                    MemberExpr {
                        obj: Box::new(completion_value.into()),
                        prop: MemberProp::Computed(ComputedPropName {
                            span: DUMMY_SP,
                            expr: Box::new(
                                Number {
                                    raw: None,
                                    value: 0.0,
                                    span: DUMMY_SP,
                                }
                                .into()
                            ),
                        }),
                        span: DUMMY_SP,
                    }
                    .into()
                }
            }
            Expr::Ident(id) => {
                for binding in &self.bindings {
                    if let Binding::Import(import) = binding {
                        if let Some(alias) = &import.alias {
                            if alias.to_id() == id.to_id() {
                                return read_env_rec(id);
                            }
                        } else if let ModuleBinding::ModuleExportName(ModuleExportName::Ident(
                            import_ident,
                        )) = &import.import
                        {
                            if import_ident.to_id() == id.to_id() {
                                return read_env_rec(id);
                            }
                        }
                    }
                }
                id.fold_children_with(self).into()
            }
            Expr::MetaProp(meta) if meta.kind == MetaPropKind::ImportMeta => {
                self.uses_import_meta = true;
                import_meta().into()
            }
            // Explicitly reject those JSX expressions that might involve Ident
            Expr::JSXMember(_) => unimplemented!(),
            Expr::JSXElement(_) => unimplemented!(),
            Expr::Invalid(_) => unreachable!(),
            _ => n.fold_children_with(self),
        }
    }
    fn fold_module(&mut self, n: Module) -> Module {
        self.transformer(n)
    }
}
