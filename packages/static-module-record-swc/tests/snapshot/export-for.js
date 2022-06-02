// @ts-nocheck
export default new StaticModuleRecord({
    bindings: [
        {
            export: "x"
        },
        {
            export: "y"
        }
    ],
    needsImportMeta: false,
    initialize: function(lexical_scope, import_meta, import_) {
        var x, y;
        lexical_scope.x = x;
        lexical_scope.y = y;
        for (var x of [
            1,
            2
        ]){
            lexical_scope.x = x;
            console.log(x);
        }
        {
            for ([x, y] of [
                [
                    1,
                    2
                ],
                [
                    2,
                    3
                ], 
            ]){
                lexical_scope.x = x;
                lexical_scope.y = y;
                console.log(x);
            }
        }
        for(x in {
            x: 1
        }){
            lexical_scope.x = x;
        }
        for([
            x = 0,
            lexical_scope.x = x
        ][0]; x < [
            1,
            2,
            3
        ].length; x++, lexical_scope.x = x){
            console.log(x);
        }
    }
});
