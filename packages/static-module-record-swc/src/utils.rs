use swc_core::common::{errors, MultiSpan, Span, DUMMY_SP};
use swc_core::ecma::ast::*;
use swc_core::ecma::atoms::JsWord;

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
        value,
        raw: None,
    }
    .into()
}

pub fn emit_error(span: Span, msg: &str) {
    let mut m_span = MultiSpan::new();
    m_span.push_span_label(span, "here".into());
    errors::HANDLER.with(|reporter| reporter.emit(&m_span, msg, errors::Level::Error));
}

pub fn relative(file_name: &String, base: &String) -> String {
    if !file_name.starts_with(base) {
        panic!("file_name {} should starts with cwd {}", file_name, base);
    }

    let uri = file_name[base.len()..].to_string().replace('\\', "/");

    if uri.starts_with('/') {
        uri
    } else {
        format!("/{}", uri)
    }
}
