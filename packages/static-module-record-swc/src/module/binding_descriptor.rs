use crate::utils::*;
use swc_common::DUMMY_SP;
use swc_plugin::ast::*;

#[derive(Clone)]
pub enum Binding {
    Import(ImportBinding),
    Export(ExportBinding),
}

#[derive(Clone)]
pub struct ImportBinding {
    pub import: ModuleBinding,
    pub alias: Option<Ident>,
    pub from: Str,
}

#[derive(Clone)]
pub struct ExportBinding {
    pub export: ModuleBinding,
    pub alias: Option<ModuleExportName>,
    pub from: Option<Str>,
}

#[derive(Clone)]
pub enum ModuleBinding {
    ModuleExportName(ModuleExportName),
    Namespace,
}

impl ToString for ModuleBinding {
    fn to_string(&self) -> String {
        match self {
            ModuleBinding::ModuleExportName(name) => match name {
                ModuleExportName::Ident(ident) => ident.to_string(),
                ModuleExportName::Str(str) => str.value.to_string(),
            },
            ModuleBinding::Namespace => "*".to_string(),
        }
    }
}

impl From<Ident> for ModuleBinding {
    fn from(x: Ident) -> Self {
        ModuleBinding::ModuleExportName(x.into())
    }
}
impl From<ModuleExportName> for ModuleBinding {
    fn from(x: ModuleExportName) -> Self {
        ModuleBinding::ModuleExportName(x)
    }
}
impl From<Str> for ModuleBinding {
    fn from(x: Str) -> ModuleBinding {
        ModuleBinding::ModuleExportName(x.into())
    }
}

impl From<ModuleBinding> for Expr {
    fn from(x: ModuleBinding) -> Expr {
        match x {
            ModuleBinding::ModuleExportName(id) => match id {
                ModuleExportName::Ident(id) => Str {
                    raw: None,
                    value: id.to_id().0,
                    span: id.span,
                }
                .into(),
                ModuleExportName::Str(f) => f.into(),
            },
            ModuleBinding::Namespace => str_lit("*".into()),
        }
    }
}
impl ModuleBinding {
    pub fn default_export() -> ModuleBinding {
        ModuleBinding::ModuleExportName(ModuleExportName::Ident(ident_default()))
    }
}
impl ImportBinding {
    pub fn to_object_lit(&self) -> ObjectLit {
        let mut result: Vec<PropOrSpread> = vec![
            key_value("import".into(), self.import.clone().into()),
            key_value("from".into(), (&self.from).clone().into()),
        ];
        if let Some(alias) = &self.alias {
            if alias.to_string() != self.import.to_string() {
                result.push(key_value("as".into(), str_lit(alias.to_id().0)));
            }
        }
        ObjectLit {
            span: DUMMY_SP,
            props: result,
        }
    }
}

impl From<ImportBinding> for Binding {
    fn from(x: ImportBinding) -> Self {
        Binding::Import(x)
    }
}

impl From<ExportBinding> for Binding {
    fn from(x: ExportBinding) -> Self {
        Binding::Export(x)
    }
}

impl ExportBinding {
    pub fn to_object_lit(&self) -> ObjectLit {
        let actual_export_value = self.alias.clone().map(|alias| match alias {
            ModuleExportName::Ident(alias) => str_lit(alias.to_id().0),
            ModuleExportName::Str(str) => str.into(),
        });
        let original_export_name = self.export.clone().into();

        ObjectLit {
            span: DUMMY_SP,
            props: if let Some(from) = &self.from {
                let mut result = vec![key_value("export".into(), original_export_name)];
                if let Some(export) = actual_export_value {
                    result.push(key_value("as".into(), export))
                }
                result.push(key_value("from".into(), from.clone().into()));
                result
            } else {
                vec![key_value(
                    "export".into(),
                    actual_export_value.unwrap_or(original_export_name),
                )]
            },
        }
    }

    #[inline]
    pub fn local(ident: &Ident) -> Binding {
        ExportBinding {
            export: (ident.clone()).into(),
            alias: None,
            from: None,
        }
        .into()
    }
}
impl Binding {
    #[inline]
    pub fn to_object_lit(&self) -> ObjectLit {
        match self {
            Binding::Import(import) => import.to_object_lit(),
            Binding::Export(export) => export.to_object_lit(),
        }
    }
}

pub struct LocalModifiableBinding {
    pub local_ident: Ident,
    pub export: ModuleExportName,
}
pub fn local_modifiable_bindings(bindings: &[Binding]) -> Vec<LocalModifiableBinding> {
    bindings
        .iter()
        .filter_map(|binding: &Binding| -> Option<LocalModifiableBinding> {
            match binding {
                Binding::Import(_) => None,
                Binding::Export(export) => {
                    if export.from.is_some() {
                        None
                    } else {
                        match &export.export {
                            ModuleBinding::ModuleExportName(name) => match name {
                                ModuleExportName::Ident(id) => Some(LocalModifiableBinding {
                                    local_ident: id.clone(),
                                    export: export
                                        .alias
                                        .clone()
                                        .unwrap_or_else(|| id.clone().into()),
                                }),
                                // export { "x" } from 'other'
                                ModuleExportName::Str(_) => None,
                            },
                            ModuleBinding::Namespace => None,
                        }
                    }
                }
            }
        })
        .collect()
}
