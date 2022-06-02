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

impl Into<ModuleBinding> for Ident {
    #[inline]
    fn into(self) -> ModuleBinding {
        ModuleBinding::ModuleExportName(self.into())
    }
}
impl Into<ModuleBinding> for ModuleExportName {
    #[inline]
    fn into(self) -> ModuleBinding {
        ModuleBinding::ModuleExportName(self)
    }
}
impl Into<ModuleBinding> for Str {
    #[inline]
    fn into(self) -> ModuleBinding {
        ModuleBinding::ModuleExportName(self.into())
    }
}

impl ModuleBinding {
    fn to_str(&self) -> Expr {
        match self {
            ModuleBinding::ModuleExportName(id) => match id {
                ModuleExportName::Ident(id) => Str {
                    raw: None,
                    value: id.to_id().0.into(),
                    span: id.span,
                }
                .into(),
                ModuleExportName::Str(f) => f.clone().into(),
            },
            ModuleBinding::Namespace => str_lit("*".into()),
        }
    }
    pub fn default_export() -> ModuleBinding {
        ModuleBinding::ModuleExportName(ModuleExportName::Ident(ident_default().into()))
    }
}
impl ImportBinding {
    pub fn to_object_lit(&self) -> ObjectLit {
        let mut result: Vec<PropOrSpread> = vec![
            key_value("import".into(), self.import.to_str()),
            key_value("from".into(), (&self.from).clone().into()),
        ];
        // TODO: omit "as" when it is the same as "import"
        if let Some(alias) = &self.alias {
            result.push(key_value("as".into(), str_lit(alias.to_id().0).into()));
        }
        ObjectLit {
            span: DUMMY_SP,
            props: result,
        }
    }
}

impl Into<Binding> for ImportBinding {
    #[inline]
    fn into(self) -> Binding {
        Binding::Import(self)
    }
}

impl Into<Binding> for ExportBinding {
    #[inline]
    fn into(self) -> Binding {
        Binding::Export(self)
    }
}

// TODO: for export default class T {},
// we should not emit { export: "T", as: "default" }
// but { export: "default" } only (since it does not have a "from" property).

// But this information is useful in our local transforming so we should keep it.
// It allows us to track the modification of T and reflect it to env.default.
impl ExportBinding {
    pub fn to_object_lit(&self) -> ObjectLit {
        let mut result: Vec<PropOrSpread> = vec![key_value("export".into(), self.export.to_str())];
        if let Some(alias) = &self.alias {
            result.push(key_value(
                "as".into(),
                match alias {
                    ModuleExportName::Ident(alias) => str_lit(alias.to_id().0).into(),
                    ModuleExportName::Str(str) => str.clone().into(),
                },
            ));
        }
        if let Some(from) = &self.from {
            result.push(key_value("from".into(), from.clone().into()));
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
pub fn local_modifiable_bindings(bindings: &Vec<Binding>) -> Vec<LocalModifiableBinding> {
    bindings
        .into_iter()
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
                                    export: export.alias.clone().unwrap_or(id.clone().into()),
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