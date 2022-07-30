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
    execute: function(_) {
        (0, _.console).log((0, _.a), (0, _.b), (0, _.c));
    }
};
