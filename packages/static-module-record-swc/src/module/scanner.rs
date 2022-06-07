use std::collections::HashSet;

use super::{binding_descriptor::*, StaticModuleRecordTransformer};
use swc_common::DUMMY_SP;
use swc_plugin::{
    ast::*,
    utils::{contains_top_level_await, quote_ident},
};

struct ScannerResult {
    bindings: Vec<Binding>,
    local_ident: HashSet<Id>,
    non_accessible_binding_id: u32,
}
impl Visit for ScannerResult {
    /// Scan all import/export bindings inside a ModuleDecl
    fn visit_module_decl(&mut self, decl: &ModuleDecl) {
        match decl {
            ModuleDecl::Import(import) if !import.type_only => {
                if import.specifiers.is_empty() {
                    self.non_accessible_binding_id += 1;
                    self.bindings.push(
                        ImportBinding {
                            import: ModuleBinding::Namespace,
                            from: import.src.clone(),
                            alias: Some(
                                // provide an invalid ident (has a space in it) so it is not accessible from the source code
                                quote_ident!(format!("import {}", self.non_accessible_binding_id))
                                    .into(),
                            ),
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
                            self.bindings.push(
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
                        ImportSpecifier::Default(spec) => self.bindings.push(
                            ImportBinding {
                                import: ModuleBinding::default_export(),
                                alias: Some(spec.local.clone()),
                                from: import.src.clone(),
                            }
                            .into(),
                        ),
                        ImportSpecifier::Namespace(spec) => self.bindings.push(
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
                Decl::Class(class) => {
                    self.local_ident.insert(class.ident.to_id());
                    self.bindings.push(ExportBinding::local(&class.ident))
                }
                Decl::Fn(f) => {
                    self.local_ident.insert(f.ident.to_id());
                    self.bindings.push(ExportBinding::local(&f.ident))
                }
                Decl::Var(var) => {
                    for decl in &var.decls {
                        self.visit_pat_inner(&decl.name, true);
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
                            self.bindings.push(
                                ExportBinding {
                                    export: ModuleBinding::Namespace,
                                    alias: Some(ns.name.clone()),
                                    from: export.src.clone(),
                                }
                                .into(),
                            );
                        }
                        ExportSpecifier::Default(spec) => {
                            self.bindings.push(
                                ExportBinding {
                                    export: ModuleBinding::default_export(),
                                    alias: Some(spec.exported.clone().into()),
                                    from: export.src.clone(),
                                }
                                .into(),
                            );
                        }
                        ExportSpecifier::Named(spec) => {
                            self.bindings.push(
                                ExportBinding {
                                    export: (&spec.orig).clone().into(),
                                    alias: (&spec.exported).clone(),
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
                    self.bindings.push(
                        ExportBinding {
                            from: None,
                            export: local_ident.into(),
                            alias: Some(Ident::new("default".into(), DUMMY_SP).into()),
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
                        from: Some(export.src.clone()),
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
    fn visit_pat(&mut self, n: &Pat) {
        self.visit_pat_inner(n, false);
        n.visit_children_with(self);
    }
    fn visit_class_decl(&mut self, n: &ClassDecl) {
        self.local_ident.insert(n.ident.to_id());
        n.visit_children_with(self);
    }
    fn visit_class_expr(&mut self, n: &ClassExpr) {
        if let Some(ident) = &n.ident {
            self.local_ident.insert(ident.to_id());
        }
        n.visit_children_with(self);
    }
    fn visit_fn_decl(&mut self, n: &FnDecl) {
        self.local_ident.insert(n.ident.to_id());
        n.visit_children_with(self);
    }
    fn visit_fn_expr(&mut self, n: &FnExpr) {
        if let Some(ident) = &n.ident {
            self.local_ident.insert(ident.to_id());
        }
        n.visit_children_with(self);
    }
    fn visit_var_declarator(&mut self, n: &VarDeclarator) {
        self.visit_pat_inner(&n.name, false);
        n.visit_children_with(self);
    }
}

impl ScannerResult {
    /// Scan all bindings inside a BindingPattern
    fn visit_pat_inner(&mut self, pat: &Pat, is_collect_bindings: bool) {
        match pat {
            Pat::Ident(id) => {
                if is_collect_bindings {
                    self.bindings.push(
                        ExportBinding {
                            from: None,
                            export: id.id.clone().into(),
                            alias: None,
                        }
                        .into(),
                    );
                }
                self.local_ident.insert(id.to_id());
            }
            Pat::Array(arr) => {
                for elem in arr.elems.iter().flatten() {
                    self.visit_pat_inner(elem, is_collect_bindings);
                }
            }
            Pat::Rest(rest) => self.visit_pat_inner(&rest.arg, is_collect_bindings),
            Pat::Object(obj) => {
                for item in &obj.props {
                    match item {
                        ObjectPatProp::KeyValue(kv) => {
                            self.visit_pat_inner(&kv.value, is_collect_bindings)
                        }
                        ObjectPatProp::Assign(assign) => {
                            if is_collect_bindings {
                                self.bindings.push(
                                    ExportBinding {
                                        from: None,
                                        export: (&assign.key).clone().into(),
                                        alias: None,
                                    }
                                    .into(),
                                );
                            }
                            self.local_ident.insert(assign.key.to_id());
                        }
                        ObjectPatProp::Rest(RestPat { arg, .. }) => {
                            self.visit_pat_inner(arg, is_collect_bindings)
                        }
                    }
                }
            }
            Pat::Assign(assign) => self.visit_pat_inner(&assign.left, is_collect_bindings),
            Pat::Invalid(_) => unreachable![],
            Pat::Expr(_) => {}
        }
    }
}

impl StaticModuleRecordTransformer {
    pub fn scan(&mut self, module: &Module) {
        let mut scanner = ScannerResult {
            bindings: vec![],
            local_ident: HashSet::new(),
            non_accessible_binding_id: 0,
        };
        module.visit_with(&mut scanner);

        self.bindings = scanner.bindings;
        self.local_modifiable_bindings = local_modifiable_bindings(&self.bindings);
        self.uses_top_level_await = contains_top_level_await(module);
        self.local_ident = scanner.local_ident;

        self.module_env_record_ident = resolve_private_ident("_", &self.local_ident);
        self.import_context_ident = resolve_private_ident("context", &self.local_ident);
    }
}

pub fn resolve_private_ident(str: &str, local_ident: &HashSet<Id>) -> Ident {
    // use starts_with not eq because we need to get the un-hygiene name
    if local_ident.iter().all(|id| !id.0.starts_with(str)) {
        return Ident::new(str.into(), DUMMY_SP);
    }

    let mut i = 0;
    let current_search = format!("{}_{}", str, i);
    for (name, _) in local_ident {
        if name.starts_with(&current_search) {
            i += 1;
            continue;
        }
    }
    Ident::new(current_search.into(), DUMMY_SP)
}
