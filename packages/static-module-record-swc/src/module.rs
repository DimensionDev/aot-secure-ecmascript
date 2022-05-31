use crate::binding_descriptor::*;
use crate::utils::*;
use swc_common::DUMMY_SP;
use swc_plugin::ast::*;
use swc_plugin::utils::member_expr;

pub struct StaticModuleRecordTransformer {
    uses_import_meta: bool,
    bindings: Vec<Binding>,
}

impl StaticModuleRecordTransformer {
    pub fn new() -> Self {
        Self {
            uses_import_meta: false,
            bindings: Vec::new(),
        }
    }
}

pub fn scan_module_item(module_item: &ModuleItem) -> Vec<Binding> {
    let mut result = Vec::new();

    if let ModuleItem::ModuleDecl(decl) = module_item {
        match decl {
            ModuleDecl::Import(import) => {
                if import.type_only {
                    return vec![];
                }
                for item in &import.specifiers {
                    match item {
                        ImportSpecifier::Named(spec) => {
                            if import.type_only {
                                continue;
                            }
                            result.push(
                                ImportBinding {
                                    import: (&spec.imported)
                                        .as_ref()
                                        .unwrap_or(&ModuleExportName::Ident(spec.local.clone()))
                                        .clone()
                                        .into(),
                                    alias: Some(spec.local.clone()),
                                    from: import.src.clone(),
                                }
                                .into(),
                            );
                        }
                        ImportSpecifier::Default(spec) => result.push(
                            ImportBinding {
                                import: ModuleBinding::Default,
                                alias: Some(spec.local.clone()),
                                from: import.src.clone(),
                            }
                            .into(),
                        ),
                        ImportSpecifier::Namespace(spec) => result.push(
                            ImportBinding {
                                import: ModuleBinding::Namespace,
                                alias: Some(spec.local.clone()),
                                from: import.src.clone(),
                            }
                            .into(),
                        ),
                    }
                }
            }
            ModuleDecl::ExportDecl(export) => match &export.decl {
                Decl::Class(class) => result.push(ExportBinding::local(&class.ident)),
                Decl::Fn(f) => result.push(ExportBinding::local(&f.ident)),
                Decl::Var(var) => {
                    for decl in &var.decls {
                        result.append(&mut scan_pat(&decl.name));
                    }
                }
                // No TS support.
                Decl::TsInterface(_) => unimplemented!(),
                Decl::TsTypeAlias(_) => unimplemented!(),
                Decl::TsEnum(_) => unimplemented!(),
                Decl::TsModule(_) => unimplemented!(),
            },
            ModuleDecl::ExportNamed(export) => {
                if export.type_only {
                    return vec![];
                }
                for spec in &export.specifiers {
                    match spec {
                        ExportSpecifier::Namespace(ns) => {
                            result.push(
                                ExportBinding {
                                    export: ModuleBinding::Namespace,
                                    alias: Some(ns.name.clone()),
                                    from: export.src.clone(),
                                }
                                .into(),
                            );
                        }
                        ExportSpecifier::Default(spec) => {
                            result.push(
                                ExportBinding {
                                    export: ModuleBinding::Default,
                                    alias: Some(spec.exported.clone().into()),
                                    from: export.src.clone(),
                                }
                                .into(),
                            );
                        }
                        ExportSpecifier::Named(spec) => {
                            result.push(
                                ExportBinding {
                                    export: (&spec.orig).clone().into(),
                                    alias: (&spec.exported).clone().into(),
                                    from: export.src.clone(),
                                }
                                .into(),
                            );
                        }
                    }
                }
            }
            ModuleDecl::ExportDefaultDecl(export) => {
                let local_ident: Option<ModuleExportName> = match &export.decl {
                    DefaultDecl::Class(class) => class.ident.clone().map(|x| x.into()),
                    DefaultDecl::Fn(f) => f.ident.clone().map(|x| x.into()),
                    DefaultDecl::TsInterfaceDecl(_) => unimplemented!(),
                };
                if let Some(local_ident) = local_ident {
                    result.push(
                        ExportBinding {
                            from: None,
                            export: local_ident.into(),
                            alias: Some(Ident::new("default".into(), DUMMY_SP).into()),
                        }
                        .into(),
                    );
                } else {
                    result.push(
                        ExportBinding {
                            from: None,
                            export: ModuleBinding::Default,
                            alias: None,
                        }
                        .into(),
                    );
                }
            }
            ModuleDecl::ExportDefaultExpr(_) => {
                result.push(
                    ExportBinding {
                        from: None,
                        export: ModuleBinding::Default,
                        alias: None,
                    }
                    .into(),
                );
            }
            ModuleDecl::ExportAll(export) => {
                result.push(
                    ExportBinding {
                        from: Some(export.src.clone()),
                        export: ModuleBinding::Namespace,
                        alias: None,
                    }
                    .into(),
                );
            }
            // No TS support.
            ModuleDecl::TsImportEquals(_) => unimplemented!(),
            ModuleDecl::TsExportAssignment(_) => unimplemented!(),
            ModuleDecl::TsNamespaceExport(_) => unimplemented!(),
        };
    };
    result
}

pub fn scan_pat(pat: &Pat) -> Vec<Binding> {
    match pat {
        Pat::Ident(id) => vec![ExportBinding {
            from: None,
            export: id.id.clone().into(),
            alias: None,
        }
        .into()],
        Pat::Array(arr) => (&arr.elems)
            .into_iter()
            .filter_map(|x| x.as_ref().map(|x| scan_pat(&x)))
            .flat_map(|x| x.into_iter())
            .collect(),
        Pat::Rest(rest) => scan_pat(&rest.arg),
        Pat::Object(obj) => (&obj.props)
            .into_iter()
            .map(|x| match x {
                ObjectPatProp::KeyValue(kv) => scan_pat(&kv.value),
                ObjectPatProp::Assign(assign) => vec![ExportBinding {
                    from: None,
                    export: (&assign.key).clone().into(),
                    alias: None,
                }
                .into()],
                ObjectPatProp::Rest(RestPat { arg, .. }) => scan_pat(arg),
            })
            .flat_map(|x| x.into_iter())
            .collect(),
        Pat::Assign(assign) => scan_pat(&assign.left),
        Pat::Invalid(_) => vec![],
        Pat::Expr(_) => vec![],
    }
}

impl Fold for StaticModuleRecordTransformer {
    /// Convert code into
    /// ```js
    /// export default new StaticModuleRecord({
    ///     bindings: ...,
    ///     needsImportMeta: ...,
    ///     [async?] initialize(env, importMeta, dynamicImport) {}
    /// })
    /// ```
    fn fold_module(&mut self, n: Module) -> Module {
        let has_top_level_await = swc_plugin::utils::contains_top_level_await(&n);
        self.bindings = (&n.body).into_iter().flat_map(scan_module_item).collect();

        let new_child = n
            .fold_children_with(self)
            .body
            .into_iter()
            // TODO: convert ModuleItem into Stmt that reference to the module_environment_record
            .filter_map(|x| x.stmt())
            .collect();

        let initialize_fn = Function {
            is_generator: false,
            is_async: has_top_level_await,
            return_type: None,
            type_params: None,
            body: Some(BlockStmt {
                span: DUMMY_SP,
                stmts: new_child,
            }),
            decorators: vec![],
            params: vec![
                param(module_environment_record()),
                param(import_meta()),
                param(dynamic_import()),
            ],
            span: DUMMY_SP,
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
                        function: initialize_fn,
                    }
                    .into(),
                ),
            ],
        };
        let new_expr = NewExpr {
            span: DUMMY_SP,
            callee: member_expr!(DUMMY_SP, StaticModuleRecord),
            type_args: None,
            args: Some(vec![ExprOrSpread {
                expr: Box::new(third_party_module.into()),
                spread: None,
            }]),
        };
        let export_default_expr: ModuleDecl = ExportDefaultExpr {
            span: DUMMY_SP,
            expr: Box::new(new_expr.into()),
        }
        .into();
        Module {
            span: DUMMY_SP,
            shebang: None,
            body: vec![export_default_expr.into()],
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
    fn fold_callee(&mut self, n: Callee) -> Callee {
        if n.is_import() {
            Callee::Expr(Box::new(dynamic_import().into()))
        } else {
            n.fold_children_with(self)
        }
    }
}
