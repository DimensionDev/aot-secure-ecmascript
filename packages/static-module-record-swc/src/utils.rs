use swc_common::DUMMY_SP;
use swc_plugin::ast::*;

pub fn ident_default() -> Ident {
    Ident::new("default".into(), DUMMY_SP)
}

pub fn static_module_record() -> Ident {
    Ident::new("StaticModuleRecord".into(), DUMMY_SP)
}

pub fn key_value(key: JsWord, expr: Expr) -> PropOrSpread {
    PropOrSpread::Prop(Box::new(
        KeyValueProp {
            key: Ident::new(key, DUMMY_SP).into(),
            value: Box::new(expr),
        }
        .into(),
    ))
}

pub fn param(id: Ident) -> Param {
    Param {
        span: DUMMY_SP,
        decorators: vec![],
        pat: BindingIdent { id, type_ann: None }.into(),
    }
}

pub fn str_lit(value: JsWord) -> Expr {
    Str {
        span: DUMMY_SP,
        value: value.into(),
        raw: None,
    }
    .into()
}
