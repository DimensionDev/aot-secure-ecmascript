use crate::utils::*;
use swc_common::DUMMY_SP;
use swc_plugin::{ast::*, utils::quote_ident};

#[derive(Clone, PartialEq, Eq)]
pub enum Binding {
    Import(ImportBinding),
    Export(ExportBinding),
}

#[derive(Clone, PartialEq, Eq)]
pub struct ImportBinding {
    pub import: ModuleBinding,
    pub alias: Option<Ident>,
    pub from: Str,
}

#[derive(Clone, PartialEq, Eq)]
pub struct ExportBinding {
    pub export: ModuleBinding,
    pub alias: Option<ModuleExportName>,
    pub from: Option<Str>,
}

impl ExportBinding {
    pub fn simple(ident: &Ident) -> Self {
        Self {
            export: (ident.clone()).into(),
            alias: None,
            from: None,
        }
    }
}

#[derive(Clone, PartialEq, Eq)]
pub enum ModuleBinding {
    ModuleExportName(ModuleExportName),
    Namespace,
}

impl ModuleBinding {
    pub fn ident(&self) -> Option<&Ident> {
        match self {
            ModuleBinding::ModuleExportName(ModuleExportName::Ident(ident)) => Some(ident),
            _ => None,
        }
    }
}

fn module_export_name_to_str(binding: &ModuleExportName) -> String {
    match binding {
        ModuleExportName::Ident(ident) => ident.to_id().0.to_string(),
        ModuleExportName::Str(str) => str.value.to_string(),
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
        ModuleBinding::ModuleExportName(ModuleExportName::Ident(quote_ident!("default")))
    }
}
impl ImportBinding {
    pub fn to_object_lit(&self) -> ObjectLit {
        let mut result: Vec<PropOrSpread> = Vec::with_capacity(3);
        match &self.import {
            ModuleBinding::Namespace => {
                result.push(key_value("importAllFrom".into(), self.from.clone().into()));
                result.push(key_value(
                    "as".into(),
                    str_lit(self.alias.clone().unwrap().to_id().0),
                ));
            }
            ModuleBinding::ModuleExportName(binding) => {
                result.push(key_value("import".into(), self.import.clone().into()));
                result.push(key_value("from".into(), self.from.clone().into()));
                if let Some(alias) = &self.alias {
                    if alias.to_id().0 != module_export_name_to_str(binding) {
                        result.push(key_value("as".into(), str_lit(alias.to_id().0)));
                    }
                }
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
        let mut result: Vec<PropOrSpread> = Vec::with_capacity(3);
        match &self.export {
            ModuleBinding::Namespace => {
                result.push(key_value(
                    "exportAllFrom".into(),
                    self.from.clone().unwrap().into(),
                ));
                if let Some(alias) = &self.alias {
                    result.push(key_value(
                        "as".into(),
                        str_lit(module_export_name_to_str(alias).into()),
                    ));
                }
            }
            ModuleBinding::ModuleExportName(export_value) => {
                let actual_export_name = self
                    .alias
                    .clone()
                    .map(|alias| module_export_name_to_str(&alias));
                let original_export_name = module_export_name_to_str(export_value);

                if let Some(actual_export_name) = actual_export_name {
                    if actual_export_name == original_export_name {
                        result.push(key_value(
                            "export".into(),
                            str_lit(original_export_name.into()),
                        ));
                    } else if self.from.is_none() {
                        result.push(key_value(
                            "export".into(),
                            str_lit(actual_export_name.into()),
                        ));
                    } else {
                        result.push(key_value(
                            "export".into(),
                            str_lit(original_export_name.into()),
                        ));
                        result.push(key_value("as".into(), str_lit(actual_export_name.into())));
                    }
                } else {
                    result.push(key_value(
                        "export".into(),
                        str_lit(original_export_name.into()),
                    ));
                }
                if let Some(from) = &self.from {
                    result.push(key_value("from".into(), from.clone().into()))
                }
            }
        }

        ObjectLit {
            span: DUMMY_SP,
            props: result,
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
    pub(crate) fn to_array_lit(bindings: &Vec<Binding>) -> ArrayLit {
        let mut item: Vec<Option<ExprOrSpread>> = Vec::with_capacity(bindings.len());
        for binding in bindings {
            let lit = match binding {
                Binding::Import(import) => import.to_object_lit(),
                Binding::Export(export) => export.to_object_lit(),
            };
            item.push(Some(ExprOrSpread {
                spread: None,
                expr: Box::new(lit.into()),
            }));
        }
        ArrayLit {
            span: DUMMY_SP,
            elems: item,
        }
    }
}

pub struct LiveExportTracingBinding {
    pub local_ident: Ident,
    pub export: ModuleExportName,
}
impl LiveExportTracingBinding {
    pub fn simple(id: &Ident) -> LiveExportTracingBinding {
        LiveExportTracingBinding {
            local_ident: id.clone(),
            export: ModuleExportName::Ident(id.clone()),
        }
    }
    pub fn complex(id: &Ident, export: &ModuleExportName) -> LiveExportTracingBinding {
        LiveExportTracingBinding {
            local_ident: id.clone(),
            export: export.clone(),
        }
    }
}
