use std::ops::Deref;

use swc_common::DUMMY_SP;
use swc_plugin::{ast::*, utils::quote_ident};

use super::{
    codegen::{assign_prop, prop_access, undefined_this_wrapper},
    VirtualModuleRecordTransformer,
};

impl VirtualModuleRecordTransformer {
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
                            vec![expr_to_stmt(assign_prop(
                                self.module_env_record_ident.clone(),
                                quote_ident!("default").into(),
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
                            vec![expr_to_stmt(assign_prop(
                                self.module_env_record_ident.clone(),
                                quote_ident!("default").into(),
                                Box::new(node.fold_children_with(self).into()),
                            ))]
                        }
                    }
                    DefaultDecl::TsInterfaceDecl(_) => unimplemented!(),
                },
                // export default expr => env.default = expr
                ModuleDecl::ExportDefaultExpr(node) => vec![expr_to_stmt(assign_prop(
                    self.module_env_record_ident.clone(),
                    quote_ident!("default").into(),
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
                if tracing.is_empty() {
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
                        self.trace_live_export_pat(pat, &mut tracing);
                    }
                };
                if tracing.is_empty() {
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
                        self.trace_live_export_pat(pat, &mut tracing);
                    }
                };
                if tracing.is_empty() {
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
            _ => vec![node.fold_children_with(self)],
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
                for pat in arr.elems.iter().flatten() {
                    self.trace_live_export_pat(pat, tracing);
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
            Pat::Expr(expr) => {
                if let Expr::Ident(ident) = expr.as_ref() {
                    self.trace_live_export_ident(ident, tracing)
                }
            }
        }
    }
    fn trace_live_export_ident(&self, local_ident: &Ident, tracing: &mut Vec<Expr>) {
        let mut need_init_expr = false;
        let init_expr: Expr = local_ident.clone().into();
        let assign = (&self.local_resolved_bindings)
            .iter()
            .filter(|x| x.local_ident.to_id() == local_ident.to_id())
            .fold(init_expr, |expr, x| {
                need_init_expr = true;
                match &x.export {
                    ModuleExportName::Ident(ident) => assign_prop(
                        self.module_env_record_ident.clone(),
                        MemberProp::Ident(ident.clone()),
                        Box::new(expr),
                    ),
                    ModuleExportName::Str(str) => assign_prop(
                        self.module_env_record_ident.clone(),
                        MemberProp::Computed(ComputedPropName {
                            span: DUMMY_SP,
                            expr: Box::new(str.clone().into()),
                        }),
                        Box::new(expr),
                    ),
                }
            });
        if need_init_expr {
            tracing.push(assign);
        }
    }
    fn need_ident_fold(&self, id: &Ident) -> bool {
        let is_arguments = self.may_include_implicit_arguments && id.sym == js_word!("arguments");
        let is_imported = self.is_imported(id);
        let is_unresolved = self.is_unresolved(id);
        is_imported || (is_unresolved && !is_arguments)
    }
    fn fold_ident_inner(&mut self, id: &Ident, avoid_this: bool) -> Expr {
        if self.is_imported(id) {
            Some(prop_access(
                self.module_env_record_ident.clone(),
                id.clone(),
            ))
        } else if self.is_unresolved(id)
            && !(self.may_include_implicit_arguments && id.sym == js_word!("arguments"))
        {
            self.uses_global_lookup = true;
            Some(prop_access(self.global_this_ident.clone(), id.clone()))
        } else {
            None
        }
        .map(|expr| {
            if avoid_this {
                undefined_this_wrapper(expr)
            } else {
                expr
            }
        })
        .unwrap_or_else(|| id.clone().into())
    }
    fn is_unresolved(&self, id: &Ident) -> bool {
        id.span.ctxt == self.unresolved
    }
    fn is_imported(&self, id: &Ident) -> bool {
        self.imported_ident.contains_key(&id.to_id())
    }
}

// https://rustdoc.swc.rs/swc_ecma_visit/trait.Fold.html
impl Fold for VirtualModuleRecordTransformer {
    fn fold_function(&mut self, n: Function) -> Function {
        let old = self.may_include_implicit_arguments;
        self.may_include_implicit_arguments = true;
        let n = n.fold_children_with(self);
        self.may_include_implicit_arguments = old;
        n
    }
    fn fold_class(&mut self, n: Class) -> Class {
        let old = self.may_include_implicit_arguments;
        self.may_include_implicit_arguments = false;
        let n = n.fold_children_with(self);
        self.may_include_implicit_arguments = old;
        n
    }
    fn fold_callee(&mut self, n: Callee) -> Callee {
        match &n {
            Callee::Import(_) => {
                self.uses_dynamic_import = true;
                Callee::Expr(Box::new(Expr::Member(MemberExpr {
                    obj: Box::new(self.import_context_ident.clone().into()),
                    prop: MemberProp::Ident(quote_ident!("import")),
                    span: DUMMY_SP,
                })))
            }
            Callee::Expr(expr) => {
                if let Expr::Ident(ident) = expr.deref() {
                    Callee::Expr(Box::new(self.fold_ident_inner(ident, true)))
                } else {
                    n.fold_children_with(self)
                }
            }
            _ => n.fold_children_with(self),
        }
    }
    fn fold_expr(&mut self, n: Expr) -> Expr {
        match n {
            Expr::Update(expr) => {
                if let Some(id) = (&expr.arg).as_ident() {
                    let mut tracing = vec![];
                    self.trace_live_export_ident(id, &mut tracing);
                    if tracing.is_empty() && !self.is_unresolved(id) {
                        expr.fold_children_with(self).into()
                    } else {
                        tracing.insert(0, expr.fold_children_with(self).into());
                        SeqExpr {
                            exprs: tracing.into_iter().map(Box::new).collect(),
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

                if tracing.is_empty() {
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
            Expr::Ident(id) => self.fold_ident_inner(&id, false),
            Expr::MetaProp(meta) if meta.kind == MetaPropKind::ImportMeta => {
                self.uses_import_meta = true;
                Expr::Member(MemberExpr {
                    obj: Box::new(self.import_context_ident.clone().into()),
                    prop: MemberProp::Ident(quote_ident!("importMeta")),
                    span: DUMMY_SP,
                })
            }
            // Explicitly reject those JSX expressions that might involve Ident
            Expr::JSXMember(_) => unimplemented!(),
            Expr::JSXElement(_) => unimplemented!(),
            Expr::Invalid(_) => unreachable!(),
            _ => n.fold_children_with(self),
        }
    }
    fn fold_tagged_tpl(&mut self, n: TaggedTpl) -> TaggedTpl {
        if let Expr::Ident(ident) = n.tag.as_ref() {
            TaggedTpl {
                tag: Box::new(self.fold_ident_inner(ident, true)),
                ..n.fold_children_with(self)
            }
        } else {
            n.fold_children_with(self)
        }
    }
    fn fold_prop(&mut self, n: Prop) -> Prop {
        if let Prop::Shorthand(id) = &n {
            if self.need_ident_fold(id) {
                Prop::KeyValue(KeyValueProp {
                    key: PropName::Ident(id.clone()),
                    value: Box::new(self.fold_ident_inner(id, false)),
                })
            } else {
                n
            }
        } else {
            n.fold_children_with(self)
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
            self,
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
    fn fold_pat(&mut self, pat: Pat) -> Pat {
        if let Pat::Ident(ident) = pat {
            Pat::Expr(self.fold_ident_inner(&ident, false).into())
        } else {
            pat.fold_children_with(self)
        }
    }
    fn fold_object_pat_prop(&mut self, n: ObjectPatProp) -> ObjectPatProp {
        if let ObjectPatProp::Assign(n) = n {
            if self.need_ident_fold(&n.key) {
                ObjectPatProp::KeyValue(KeyValuePatProp {
                    value: Box::new(Pat::Expr(Box::new(self.fold_ident_inner(&n.key, false)))),
                    key: n.key.into(),
                })
            } else {
                n.fold_children_with(self).into()
            }
        } else {
            n.fold_children_with(self)
        }
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
