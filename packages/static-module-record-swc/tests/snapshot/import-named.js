// @ts-nocheck
export default {
    bindings: [
        {
            import: "a",
            from: 'mod',
            as: "a"
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
    initialize: function(_, import_meta, import_) {
        _.console.log(_.a, _.b, _.c);
    }
};
