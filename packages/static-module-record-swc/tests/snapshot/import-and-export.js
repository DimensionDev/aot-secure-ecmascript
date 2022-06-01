// @ts-nocheck
export default (StaticModuleRecord)=>new StaticModuleRecord({
        bindings: [
            {
                import: "x",
                from: 'live-test',
                as: "x"
            },
            {
                import: "setX",
                from: 'live-test',
                as: "setX"
            }
        ],
        needsImportMeta: false,
        initialize: function(lexical_scope, import_meta, import_) {
            debugger;
            lexical_scope.setX(1);
            lexical_scope.x;
        }
    });
