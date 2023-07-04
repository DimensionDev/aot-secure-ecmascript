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
            export: "f"
        },
        {
            export: "x1"
        },
        {
            export: "x2"
        },
        {
            export: "x3"
        }
    ],
    execute: function(__, context) {
        var _ = context.globalThis;
        {
            var a = 1;
            __.b = __.a = a;
            function c() {
                [
                    a = 2,
                    __.b = __.a = a
                ][0];
            }
        }
        {
            for(var f = 0; f < [].length; f++){
                __.f = f;
            }
            for (f of []){
                __.f = f;
            }
            for(f in {}){
                __.f = f;
            }
        }
        let [x1, { key: x2, ...x3 }] = _.expr;
        __.x1 = x1;
        __.x2 = x2;
        __.x3 = x3;
        [
            [x1, x2, x3] = _.expr2,
            __.x1 = x1,
            __.x2 = x2,
            __.x3 = x3
        ][0];
    }
};
