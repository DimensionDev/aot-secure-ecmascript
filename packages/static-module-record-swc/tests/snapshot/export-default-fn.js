// @ts-nocheck
export default new StaticModuleRecord({
    bindings: [
        {
            export: "_ref",
            as: "default"
        }
    ],
    needsImportMeta: false,
    initialize: function(lexical_scope, import_meta, import_) {
        lexical_scope.default = function _ref() {};
    }
});
