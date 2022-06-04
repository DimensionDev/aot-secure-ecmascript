// @ts-nocheck
export default {
    bindings: [
        {
            export: "default"
        }
    ],
    needsImportMeta: false,
    initialize: function(_, import_meta, import_) {
        _.default = 'foo';
    }
};
