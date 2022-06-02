// @ts-nocheck
export default new StaticModuleRecord({
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
    initialize: function(lexical_scope, import_meta, import_) {
        class T {
        }
        lexical_scope.T = lexical_scope.default = T;
    }
});
