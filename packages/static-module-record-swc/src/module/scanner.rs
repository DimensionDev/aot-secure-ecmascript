use super::{binding_descriptor::*, StaticModuleRecordTransformer};
use swc_common::DUMMY_SP;
use swc_plugin::{ast::*, utils::contains_top_level_await};

/// Scan all import/export bindings inside a ModuleDecl
pub fn scan_module_item(decl: &ModuleDecl) -> Vec<Binding> {
    let mut result = Vec::new();

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
                            import: ModuleBinding::default_export(),
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
                                export: ModuleBinding::default_export(),
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
                        export: ModuleBinding::default_export(),
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
                    export: ModuleBinding::default_export(),
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
    result
}

/// Scan all bindings inside a BindingPattern
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
        Pat::Invalid(_) => unreachable![],
        Pat::Expr(_) => todo![],
    }
}

impl StaticModuleRecordTransformer {
    pub fn scan(&mut self, n: &Module) {
        self.bindings = (&n.body)
            .into_iter()
            .filter_map(|x| x.as_module_decl())
            .flat_map(scan_module_item)
            .collect();
        self.local_modifiable_bindings = local_modifiable_bindings(&self.bindings);
        self.uses_top_level_await = contains_top_level_await(n);
    }
}
