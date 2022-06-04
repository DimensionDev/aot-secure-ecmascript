// @ts-nocheck
export default {
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
    initialize: function(_, import_meta, import_) {
        const a = 1;
        _.z = _.a = a;
        const [b, c] = [
            1,
            2
        ];
        _.b = b;
        _.c = c;
        const { alert , ...rest } = _.globalThis;
        _.alert = alert;
        _.rest = rest;
        const [d, ...[{ x =1  }]] = [
            1,
            {
                x: 1
            }
        ];
        _.d = d;
        _.x = x;
        class T {
        }
        _.T = T;
    }
};
