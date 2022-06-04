// @ts-nocheck
export default {
    bindings: [
        {
            export: "T",
            as: "default"
        },
        {
            export: "T"
        }
    ],
    needsImportMeta: false,
    initialize: function(_, import_meta, import_) {
        class T {
        }
        _.T = _.default = T;
    }
};
