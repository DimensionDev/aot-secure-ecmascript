use swc_common::{errors::Level, MultiSpan, Span, DUMMY_SP};
use swc_plugin::ast::*;

pub fn ident_default() -> Ident {
    Ident::new("default".into(), DUMMY_SP)
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

pub fn emit_error(span: Span, msg: &str) {
    let mut m_span = MultiSpan::new();
    m_span.push_span_label(span, "here".into());
    swc_plugin::errors::HANDLER
        .inner
        .get()
        .unwrap()
        .emit(&m_span, msg, Level::Error);
}
