// @ts-nocheck
export default new StaticModuleRecord({
    bindings: [
        {
            export: "a"
        },
        {
            export: "b"
        },
        {
            export: "c"
        },
        {
            export: "alert"
        },
        {
            export: "rest"
        },
        {
            export: "d"
        },
        {
            export: "x"
        },
        {
            export: "a",
            as: "z"
        },
        {
            export: "T"
        }
    ],
    needsImportMeta: false,
    initialize: function(lexical_scope, import_meta, import_) {
        const a = 1;
        lexical_scope.z = lexical_scope.a = a;
        const [b, c] = [
            1,
            2
        ];
        lexical_scope.b = b;
        lexical_scope.c = c;
        const { alert , ...rest } = globalThis;
        lexical_scope.alert = alert;
        lexical_scope.rest = rest;
        const [d, ...[{ x =1  }]] = [
            1,
            {
                x: 1
            }
        ];
        lexical_scope.d = d;
        lexical_scope.x = x;
        class T {
        }
        lexical_scope.T = T;
    }
});
