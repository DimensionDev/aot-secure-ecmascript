// @ts-nocheck
export default (StaticModuleRecord)=>new StaticModuleRecord({
        bindings: [
            {
                export: "x"
            },
            {
                export: "setX"
            }
        ],
        needsImportMeta: false,
        initialize: function(lexical_scope, import_meta, import_) {
            let x;
            lexical_scope.x = x;
            function setX(value) {
                x = value;
                lexical_scope.x = x;
            }
            lexical_scope.setX = setX;
        }
    });
