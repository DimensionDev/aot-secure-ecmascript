// @ts-nocheck
export default {
    bindings: [
        {
            export: "named"
        },
        {
            export: "T"
        }
    ],
    needsImportMeta: false,
    initialize: function(_, import_meta, import_) {
        function named() {}
        _.named = named;
        class T {
        }
        _.T = T;
    }
};
