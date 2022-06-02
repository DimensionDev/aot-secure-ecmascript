use swc_common::DUMMY_SP;
use swc_plugin::ast::*;

use crate::utils::*;

use super::{
    binding_descriptor::{Binding, ModuleBinding},
    codegen::{assign_env_rec, read_env_rec},
    StaticModuleRecordTransformer,
};

impl StaticModuleRecordTransformer {
    pub fn fold_module_item_to_multiple(&mut self, item: ModuleItem) -> Vec<Stmt> {
        match item {
            ModuleItem::ModuleDecl(decl) => match decl {
                // drop all imports. all access will be converted into ModuleEnvironmentRecord access.
                ModuleDecl::Import(_) => vec![],
                // export { x } from 'y'
                // export { x as y }
                // drop all named exports because it will be handled on the definition site (the referenced value may be in the TDZ).
                ModuleDecl::ExportNamed(_) => vec![],
                ModuleDecl::ExportDecl(decl) => match decl.decl {
                    Decl::Class(x) => self.fold_declaration_to_multiple(x.into()),
                    Decl::Fn(x) => self.fold_declaration_to_multiple(x.into()),
                    Decl::Var(x) => self.fold_declaration_to_multiple(x.into()),
                    Decl::TsInterface(_) => unimplemented![],
                    Decl::TsTypeAlias(_) => unimplemented![],
                    Decl::TsEnum(_) => unimplemented!(),
                    Decl::TsModule(_) => unimplemented!(),
                },
                // for unnamed default exports, same as `export default expr`
                // for named default exports:
                // export default function x()
                // =>
                // function x()
                // env.x = x
                ModuleDecl::ExportDefaultDecl(decl) => match decl.decl {
                    DefaultDecl::Class(node) => {
                        if let Some(name) = node.ident {
                            self.fold_declaration_to_multiple(
                                ClassDecl {
                                    class: node.class,
                                    ident: name,
                                    declare: false,
                                }
                                .into(),
                            )
                        } else {
                            vec![expr_to_stmt(assign_env_rec(
                                ident_default().into(),
                                Box::new(node.fold_children_with(self).into()),
                            ))]
                        }
                    }
                    DefaultDecl::Fn(node) => {
                        if let Some(name) = node.ident {
                            self.fold_declaration_to_multiple(
                                FnDecl {
                                    function: node.function,
                                    ident: name,
                                    declare: false,
                                }
                                .into(),
                            )
                        } else {
                            vec![expr_to_stmt(assign_env_rec(
                                ident_default().into(),
                                Box::new(node.fold_children_with(self).into()),
                            ))]
                        }
                    }
                    DefaultDecl::TsInterfaceDecl(_) => unimplemented!(),
                },
                // export default expr => env.default = expr
                ModuleDecl::ExportDefaultExpr(node) => vec![expr_to_stmt(assign_env_rec(
                    ident_default().into(),
                    node.expr.fold_children_with(self),
                ))],
                // export * from './foo' => No emit
                ModuleDecl::ExportAll(_) => vec![],
                ModuleDecl::TsImportEquals(_) => unimplemented!(),
                ModuleDecl::TsExportAssignment(_) => unimplemented!(),
                ModuleDecl::TsNamespaceExport(_) => unimplemented!(),
            },
            ModuleItem::Stmt(stmt) => self.fold_stmt_to_multiple(stmt),
        }
    }
    fn fold_stmt_to_multiple(&mut self, node: Stmt) -> Vec<Stmt> {
        match node {
            Stmt::For(node) => {
                let mut tracing = vec![];
                if let Some(init) = &node.init {
                    match init {
                        VarDeclOrExpr::VarDecl(decl) => {
                            if decl.kind == VarDeclKind::Var {
                                for item in &decl.decls {
                                    self.trace_live_export_pat(&item.name, &mut tracing);
                                }
                            }
                        }
                        VarDeclOrExpr::Expr(_) => (),
                    }
                }
                if tracing.len() == 0 {
                    vec![node.fold_children_with(self).into()]
                } else {
                    vec![ForStmt {
                        init: node.init.fold_children_with(self),
                        test: node.test.map(|x| x.fold_children_with(self)),
                        update: node.update.map(|x| x.fold_children_with(self)),
                        body: prepend_stmt(
                            node.body.fold_children_with(self),
                            exprs_to_stmt(tracing),
                        ),
                        span: node.span,
                    }
                    .into()]
                }
            }
            Stmt::ForIn(node) => {
                let mut tracing = vec![];
                match &node.left {
                    // let and const has their own block-level scope.
                    VarDeclOrPat::VarDecl(decl) => {
                        if decl.kind == VarDeclKind::Var {
                            for item in &decl.decls {
                                self.trace_live_export_pat(&item.name, &mut tracing);
                            }
                        }
                    }
                    VarDeclOrPat::Pat(pat) => {
                        self.trace_live_export_pat(&pat, &mut tracing);
                    }
                };
                if tracing.len() == 0 {
                    vec![node.fold_children_with(self).into()]
                } else {
                    vec![ForInStmt {
                        body: prepend_stmt(
                            node.body.fold_children_with(self),
                            exprs_to_stmt(tracing),
                        ),
                        left: node.left.fold_children_with(self),
                        right: node.right.fold_children_with(self),
                        span: node.span,
                    }
                    .into()]
                }
            }
            // same logic as for-in
            Stmt::ForOf(node) => {
                let mut tracing = vec![];
                match &node.left {
                    // let and const has their own block-level scope.
                    VarDeclOrPat::VarDecl(decl) => {
                        if decl.kind == VarDeclKind::Var {
                            for item in &decl.decls {
                                self.trace_live_export_pat(&item.name, &mut tracing);
                            }
                        }
                    }
                    VarDeclOrPat::Pat(pat) => {
                        self.trace_live_export_pat(&pat, &mut tracing);
                    }
                };
                if tracing.len() == 0 {
                    vec![node.fold_children_with(self).into()]
                } else {
                    vec![ForOfStmt {
                        body: prepend_stmt(
                            node.body.fold_children_with(self),
                            exprs_to_stmt(tracing),
                        ),
                        left: node.left.fold_children_with(self),
                        right: node.right.fold_children_with(self),
                        await_token: node.await_token,
                        span: node.span,
                    }
                    .into()]
                }
            }
            Stmt::Decl(decl) => self.fold_declaration_to_multiple(decl),
            // no reliable analysis can be made within a with block.
            Stmt::With(_) => unimplemented!(),
            _ => vec![node.fold_children_with(self).into()],
        }
    }
    fn fold_declaration_to_multiple(&mut self, decl: Decl) -> Vec<Stmt> {
        let mut tracing = vec![];
        match &decl {
            Decl::Class(class) => self.trace_live_export_ident(&class.ident, &mut tracing),
            Decl::Fn(f) => self.trace_live_export_ident(&f.ident, &mut tracing),
            Decl::Var(decl) => {
                for item in &decl.decls {
                    self.trace_live_export_pat(&item.name, &mut tracing);
                }
            }
            Decl::TsInterface(_) => unimplemented!(),
            Decl::TsTypeAlias(_) => unimplemented!(),
            Decl::TsEnum(_) => unimplemented!(),
            Decl::TsModule(_) => unimplemented!(),
        };
        std::iter::once(decl.fold_children_with(self).into())
            .chain(tracing.into_iter().map(expr_to_stmt))
            .collect()
    }
    fn trace_live_export_pat(&self, pat: &Pat, tracing: &mut Vec<Expr>) {
        match pat {
            Pat::Ident(ident) => self.trace_live_export_ident(&ident.id, tracing),
            Pat::Array(arr) => {
                for item in &arr.elems {
                    if let Some(pat) = item {
                        self.trace_live_export_pat(pat, tracing);
                    }
                }
            }
            Pat::Rest(rest) => self.trace_live_export_pat(&rest.arg, tracing),
            Pat::Object(obj) => {
                for prop in &obj.props {
                    match prop {
                        ObjectPatProp::Assign(assign) => {
                            self.trace_live_export_ident(&assign.key, tracing)
                        }
                        ObjectPatProp::KeyValue(kv) => {
                            self.trace_live_export_pat(&kv.value, tracing)
                        }
                        ObjectPatProp::Rest(rest) => self.trace_live_export_pat(&rest.arg, tracing),
                    }
                }
            }
            Pat::Assign(assign) => self.trace_live_export_pat(&assign.left, tracing),
            Pat::Invalid(_) => unreachable!(),
            // Only for for-in / for-of loops.
            // no need to handle this:
            // for (a.b in expr);
            // for (a().b of expr);
            // we only need to trace live export.
            Pat::Expr(_) => (),
        }
    }
    fn trace_live_export_ident(&self, local_ident: &Ident, tracing: &mut Vec<Expr>) {
        let init_expr: Expr = local_ident.clone().into();
        let assign = (&self.local_modifiable_bindings)
            .into_iter()
            .filter(|x| x.local_ident.to_id() == local_ident.to_id())
            .fold(init_expr, |expr, x| match &x.export {
                ModuleExportName::Ident(ident) => {
                    assign_env_rec(MemberProp::Ident(ident.clone().into()), Box::new(expr)).into()
                }
                ModuleExportName::Str(str) => assign_env_rec(
                    MemberProp::Computed(ComputedPropName {
                        span: DUMMY_SP,
                        expr: Box::new(str.clone().into()),
                    }),
                    Box::new(expr),
                )
                .into(),
            });
        tracing.push(assign);
    }
}

// https://rustdoc.swc.rs/swc_ecma_visit/trait.Fold.html
impl Fold for StaticModuleRecordTransformer {
    fn fold_callee(&mut self, n: Callee) -> Callee {
        if n.is_import() {
            Callee::Expr(Box::new(dynamic_import().into()))
        } else {
            n.fold_children_with(self)
        }
    }
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
                    tracing.insert(0, expr.fold_children_with(self).into());
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
                                .into(),
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
    fn fold_module(&mut self, module: Module) -> Module {
        self.scan(&module);
        let module = module.fold_children_with(self);
        self.codegen(
            module
                .body
                .into_iter()
                .map(|x| {
                    x.stmt()
                        .expect("all imports/exports should be converted into statement.")
                })
                .collect(),
        )
    }
    fn fold_module_items(&mut self, items: Vec<ModuleItem>) -> Vec<ModuleItem> {
        items
            .into_iter()
            .flat_map(|x| self.fold_module_item_to_multiple(x))
            .map(|x| x.into())
            .collect()
    }
    fn fold_stmts(&mut self, stmt: Vec<Stmt>) -> Vec<Stmt> {
        stmt.into_iter()
            .flat_map(|x| self.fold_stmt_to_multiple(x))
            .collect()
    }
}

fn expr_to_stmt(expr: Expr) -> Stmt {
    Stmt::Expr(ExprStmt {
        span: DUMMY_SP,
        expr: Box::new(expr),
    })
}
fn exprs_to_stmt(expr: Vec<Expr>) -> Vec<Stmt> {
    expr.into_iter().map(expr_to_stmt).collect()
}
fn prepend_stmt(stmt: Box<Stmt>, mut insert_before: Vec<Stmt>) -> Box<Stmt> {
    if let Some(block) = stmt.as_block() {
        insert_before.append(&mut block.stmts.clone());
        Box::new(
            BlockStmt {
                span: DUMMY_SP,
                stmts: insert_before,
            }
            .into(),
        )
    } else {
        insert_before.push(*stmt);
        Box::new(
            BlockStmt {
                span: DUMMY_SP,
                stmts: insert_before,
            }
            .into(),
        )
    }
}
