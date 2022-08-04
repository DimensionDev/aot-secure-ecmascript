export default {
    bindings: [
        {
            export: "a1"
        },
        {
            export: "a2"
        },
        {
            export: "a3"
        },
        {
            export: "b1"
        },
        {
            export: "b2"
        },
        {
            export: "b3"
        },
        {
            export: "c1"
        },
        {
            export: "c2"
        },
        {
            export: "c3"
        },
        {
            export: "f"
        },
        {
            export: "T"
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
        var a1;
        __.a1 = a1;
        var a2, a3;
        __.a2 = a2;
        __.a3 = a3;
        let b1;
        __.b1 = b1;
        let b2, b3;
        __.b2 = b2;
        __.b3 = b3;
        const c1 = 0;
        __.c1 = c1;
        const c2 = 0, c3 = 0;
        __.c2 = c2;
        __.c3 = c3;
        function f() {
            [
                f = function() {},
                __.f = f
            ][0];
            [
                T = class T2 {
                },
                __.T = T
            ][0];
            [
                c1 = [
                    c2 = [
                        c3 = [
                            a1 = [
                                a2 = [
                                    a3 = [
                                        b1 = [
                                            b2 = [
                                                b3 = 0,
                                                __.b3 = b3
                                            ][0],
                                            __.b2 = b2
                                        ][0],
                                        __.b1 = b1
                                    ][0],
                                    __.a3 = a3
                                ][0],
                                __.a2 = a2
                            ][0],
                            __.a1 = a1
                        ][0],
                        __.c3 = c3
                    ][0],
                    __.c2 = c2
                ][0],
                __.c1 = c1
            ][0];
        }
        __.f = f;
        class T {
        }
        __.T = T;
        let [x1, { key: x2 , ...x3 }] = _.expr;
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
