// @ts-nocheck
export default {
    bindings: [],
    needsImportMeta: true,
    initialize: function(_, import_meta, import_) {
        import_meta;
        import_meta();
        import_meta['url'];
        _.alert(import_meta.url);
    }
};
