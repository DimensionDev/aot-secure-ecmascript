// @ts-nocheck
export default new StaticModuleRecord({
    bindings: [
        {
            export: "named"
        },
        {
            export: "T"
        }
    ],
    needsImportMeta: false,
    initialize: function(lexical_scope, import_meta, import_) {
        lexical_scope.named = function named() {};
        lexical_scope.T = class T {
        };
    }
});
