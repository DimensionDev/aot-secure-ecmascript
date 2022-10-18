use std::collections::HashMap;

use super::{binding_descriptor::*, VirtualModuleRecordTransformer};
use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::*;
use swc_core::ecma::utils::{contains_top_level_await, private_ident};
use swc_core::ecma::visit::{Visit, VisitWith};

struct ScannerFirstPass(HashMap<Id, (ModuleBinding, Str)>);
impl Visit for ScannerFirstPass {
    fn visit_import_decl(&mut self, n: &ImportDecl) {
        if n.type_only {
            return;
        }
        for specifier in n.specifiers.iter() {
            match specifier {
                ImportSpecifier::Named(named) => {
                    self.0.insert(
                        named.local.to_id(),
                        (
                            named
                                .imported
                                .clone()
                                .unwrap_or_else(|| named.local.clone().into())
                                .into(),
                            *n.src.clone(),
                        ),
                    );
                }
                ImportSpecifier::Default(default) => {
                    self.0.insert(
                        default.local.to_id(),
                        (ModuleBinding::default_export(), *n.src.clone()),
                    );
                }
                ImportSpecifier::Namespace(namespace) => {
                    self.0.insert(
                        namespace.local.to_id(),
                        (ModuleBinding::Namespace, *n.src.clone()),
                    );
                }
            }
        }
    }
}

struct ScannerSecondPass {
    bindings: Vec<Binding>,
    phantom_import_binding_id: u32,
    imported_ident: HashMap<Id, (ModuleBinding, Str)>,
    live_export_tracing_bindings: Vec<LiveExportTracingBinding>,
}
impl Visit for ScannerSecondPass {
    /// Scan all import/export bindings inside a ModuleDecl
    fn visit_module_decl(&mut self, decl: &ModuleDecl) {
        match decl {
            ModuleDecl::Import(import) if !import.type_only => {
                if import.specifiers.is_empty() {
                    self.phantom_import_binding_id += 1;
                    self.bindings.push(
                        ImportBinding {
                            import: ModuleBinding::Namespace,
                            from: *import.src.clone(),
                            alias: Some(private_ident!(format!(
                                "import_{}",
                                self.phantom_import_binding_id
                            ))),
                        }
                        .into(),
                    )
                }
                for item in &import.specifiers {
                    match item {
                        ImportSpecifier::Named(spec) => {
                            if import.type_only {
                                continue;
                            }
                            let local_ident = spec.local.clone();
                            let imported_ident = if let Some(imported) = &spec.imported {
                                imported.clone()
                            } else {
                                ModuleExportName::Ident(spec.local.clone())
                            };
                            self.bindings.push(
                                ImportBinding {
                                    import: imported_ident.into(),
                                    alias: Some(local_ident),
                                    from: *import.src.clone(),
                                }
                                .into(),
                            );
                        }
                        ImportSpecifier::Default(spec) => self.bindings.push(
                            ImportBinding {
                                import: ModuleBinding::default_export(),
                                alias: Some(spec.local.clone()),
                                from: *import.src.clone(),
                            }
                            .into(),
                        ),
                        ImportSpecifier::Namespace(spec) => self.bindings.push(
                            ImportBinding {
                                import: ModuleBinding::Namespace,
                                alias: Some(spec.local.clone()),
                                from: *import.src.clone(),
                            }
                            .into(),
                        ),
                    }
                }
            }
            ModuleDecl::ExportDecl(export) => match &export.decl {
                Decl::Class(class) => {
                    self.bindings.push(ExportBinding::local(&class.ident));
                    self.live_export_tracing_bindings
                        .push(LiveExportTracingBinding::simple(&class.ident));
                }
                Decl::Fn(f) => {
                    self.bindings.push(ExportBinding::local(&f.ident));
                    self.live_export_tracing_bindings
                        .push(LiveExportTracingBinding::simple(&f.ident));
                }
                Decl::Var(var) => {
                    for decl in &var.decls {
                        self.visit_pat_inner(&decl.name);
                    }
                }
                // No TS support.
                Decl::TsInterface(_) => unimplemented!(),
                Decl::TsTypeAlias(_) => unimplemented!(),
                Decl::TsEnum(_) => unimplemented!(),
                Decl::TsModule(_) => unimplemented!(),
            },
            ModuleDecl::ExportNamed(export) if !export.type_only => {
                for spec in &export.specifiers {
                    match spec {
                        ExportSpecifier::Namespace(ns) => {
                            assert!(export.src.is_some());
                            self.bindings.push(
                                ExportBinding {
                                    export: ModuleBinding::Namespace,
                                    alias: Some(ns.name.clone()),
                                    from: export.src.clone().map(|from| *from),
                                }
                                .into(),
                            );
                        }
                        ExportSpecifier::Default(spec) => {
                            assert!(export.src.is_some());
                            self.bindings.push(
                                ExportBinding {
                                    export: ModuleBinding::default_export(),
                                    alias: Some(spec.exported.clone().into()),
                                    from: export.src.clone().map(|from| *from),
                                }
                                .into(),
                            );
                        }
                        ExportSpecifier::Named(spec) => {
                            let mut bindings_pushed = false;
                            if let ModuleExportName::Ident(ident) = &spec.orig {
                                let id = self.imported_ident.get(&ident.to_id());
                                if let Some((binding, from)) = id {
                                    assert!(export.src.is_none());
                                    self.bindings.push(
                                        ExportBinding {
                                            export: binding.clone(),
                                            alias: Some(
                                                spec.exported
                                                    .clone()
                                                    .unwrap_or_else(|| ident.clone().into()),
                                            ),
                                            from: Some(from.clone()),
                                        }
                                        .into(),
                                    );
                                    bindings_pushed = true;
                                }
                            }
                            if !bindings_pushed {
                                self.bindings.push(
                                    ExportBinding {
                                        export: spec.orig.clone().into(),
                                        alias: spec.exported.clone(),
                                        from: export.src.clone().map(|from| *from),
                                    }
                                    .into(),
                                )
                            }
                            if export.src.is_none() {
                                if let ModuleExportName::Ident(local_name) = &spec.orig {
                                    if let Some(export_name) = &spec.exported {
                                        self.live_export_tracing_bindings.push(
                                            LiveExportTracingBinding::complex(
                                                local_name,
                                                export_name,
                                            ),
                                        );
                                    } else {
                                        self.live_export_tracing_bindings
                                            .push(LiveExportTracingBinding::simple(local_name));
                                    }
                                }
                            }
                        }
                    }
                }
            }
            ModuleDecl::ExportDefaultDecl(export) => {
                let local_ident = match &export.decl {
                    DefaultDecl::Class(class) => &class.ident,
                    DefaultDecl::Fn(f) => &f.ident,
                    DefaultDecl::TsInterfaceDecl(_) => unimplemented!(),
                };
                if let Some(local_ident) = local_ident {
                    let default_ident = Ident::new("default".into(), DUMMY_SP);
                    self.live_export_tracing_bindings
                        .push(LiveExportTracingBinding {
                            local_ident: local_ident.clone(),
                            export: ModuleExportName::Ident(default_ident.clone()),
                        });
                    self.bindings.push(
                        ExportBinding {
                            from: None,
                            export: local_ident.clone().into(),
                            alias: Some(default_ident.into()),
                        }
                        .into(),
                    );
                } else {
                    self.bindings.push(
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
                self.bindings.push(
                    ExportBinding {
                        from: None,
                        export: ModuleBinding::default_export(),
                        alias: None,
                    }
                    .into(),
                );
            }
            ModuleDecl::ExportAll(export) => {
                self.bindings.push(
                    ExportBinding {
                        from: Some(*export.src.clone()),
                        export: ModuleBinding::Namespace,
                        alias: None,
                    }
                    .into(),
                );
            }
            _ => {}
        };
        decl.visit_children_with(self);
    }
}

impl ScannerSecondPass {
    /// Scan all bindings inside a BindingPattern
    fn visit_pat_inner(&mut self, pat: &Pat) {
        match pat {
            Pat::Ident(id) => {
                self.bindings.push(ExportBinding::simple(&id.id).into());
                self.live_export_tracing_bindings
                    .push(LiveExportTracingBinding::simple(&id.id));
            }
            Pat::Array(arr) => {
                for elem in arr.elems.iter().flatten() {
                    self.visit_pat_inner(elem);
                }
            }
            Pat::Rest(rest) => self.visit_pat_inner(&rest.arg),
            Pat::Object(obj) => {
                for item in &obj.props {
                    match item {
                        ObjectPatProp::KeyValue(kv) => self.visit_pat_inner(&kv.value),
                        ObjectPatProp::Assign(assign) => {
                            self.bindings
                                .push(ExportBinding::simple(&assign.key).into());
                            self.live_export_tracing_bindings
                                .push(LiveExportTracingBinding::simple(&assign.key));
                        }
                        ObjectPatProp::Rest(RestPat { arg, .. }) => self.visit_pat_inner(arg),
                    }
                }
            }
            Pat::Assign(assign) => self.visit_pat_inner(&assign.left),
            Pat::Invalid(_) => unreachable![],
            Pat::Expr(_) => {}
        }
    }
}

impl VirtualModuleRecordTransformer {
    pub fn scan(&mut self, module: &Module) {
        let mut scanner_first_pass = ScannerFirstPass(HashMap::new());
        module.visit_with(&mut scanner_first_pass);

        let mut scanner_second_pass = ScannerSecondPass {
            imported_ident: scanner_first_pass.0,
            bindings: vec![],
            phantom_import_binding_id: 0,
            live_export_tracing_bindings: vec![],
        };
        module.visit_with(&mut scanner_second_pass);

        self.bindings = scanner_second_pass.bindings;
        self.imported_ident = scanner_second_pass.imported_ident;
        self.local_resolved_bindings = scanner_second_pass.live_export_tracing_bindings;
        self.uses_top_level_await = contains_top_level_await(module);
    }
}
