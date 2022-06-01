// @ts-nocheck
export default new StaticModuleRecord({
    bindings: [],
    needsImportMeta: true,
    initialize: function(lexical_scope, import_meta, import_) {
        import_meta;
        import_meta();
        import_meta['url'];
        alert(import_meta.url);
    }
});
