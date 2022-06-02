// @ts-nocheck
export default (StaticModuleRecord)=>new StaticModuleRecord({
        bindings: [
            {
                export: "x"
            },
            {
                export: "y"
            },
            {
                export: "x",
                as: "z"
            },
            {
                export: "setX"
            }
        ],
        needsImportMeta: false,
        initialize: function(lexical_scope, import_meta, import_) {
            let x, y;
            lexical_scope.x = x;
            lexical_scope.z = x;
            lexical_scope.y = y;
            function setX(value) {
                [
                    [
                        x = value,
                        lexical_scope.x = x,
                        lexical_scope.z = x
                    ][0],
                    lexical_scope.x = x,
                    lexical_scope.z = x
                ][0];
            }
            lexical_scope.setX = setX;
            function setAll() {
                [
                    [
                        [x, y] = [
                            1,
                            2,
                            3
                        ],
                        lexical_scope.x = x,
                        lexical_scope.z = x,
                        lexical_scope.y = y
                    ][0],
                    lexical_scope.x = x,
                    lexical_scope.z = x,
                    lexical_scope.y = y
                ][0];
            }
        }
    });
