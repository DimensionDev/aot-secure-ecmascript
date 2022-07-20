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
    execute: function(_) {
        var a1;
        _.a1 = a1;
        var a2, a3;
        _.a2 = a2;
        _.a3 = a3;
        let b1;
        _.b1 = b1;
        let b2, b3;
        _.b2 = b2;
        _.b3 = b3;
        const c1 = 0;
        _.c1 = c1;
        const c2 = 0, c3 = 0;
        _.c2 = c2;
        _.c3 = c3;
        function f() {
            [
                f = function() {},
                _.f = f
            ][0];
            [
                T = class T2 {
                },
                _.T = T
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
                                                _.b3 = b3
                                            ][0],
                                            _.b2 = b2
                                        ][0],
                                        _.b1 = b1
                                    ][0],
                                    _.a3 = a3
                                ][0],
                                _.a2 = a2
                            ][0],
                            _.a1 = a1
                        ][0],
                        _.c3 = c3
                    ][0],
                    _.c2 = c2
                ][0],
                _.c1 = c1
            ][0];
        }
        _.f = f;
        class T {
        }
        _.T = T;
        let [x1, { key: x2 , ...x3 }] = _.expr;
        _.x1 = x1;
        _.x2 = x2;
        _.x3 = x3;
        [
            [x1, x2, x3] = _.expr2,
            _.x1 = x1,
            _.x2 = x2,
            _.x3 = x3
        ][0];
    }
};
