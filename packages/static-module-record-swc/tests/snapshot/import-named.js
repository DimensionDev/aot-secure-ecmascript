// @ts-nocheck
export default {
    bindings: [
        {
            import: "a",
            from: 'mod'
        },
        {
            import: "x",
            from: 'mod',
            as: "b"
        },
        {
            import: 'c wasm',
            from: 'mod',
            as: "c"
        }
    ],
    initialize: function(_) {
        _.console.log(_.a, _.b, _.c);
    }
};
