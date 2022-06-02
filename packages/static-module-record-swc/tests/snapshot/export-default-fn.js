// @ts-nocheck
export default new StaticModuleRecord({
    bindings: [
        {
            export: "_ref",
            as: "default"
        },
        {
            export: "_ref"
        }
    ],
    needsImportMeta: false,
    initialize: function(lexical_scope, import_meta, import_) {
        function _ref() {}
        lexical_scope._ref = lexical_scope.default = _ref;
    }
});
