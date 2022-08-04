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
    execute: function(__, context) {
        var _ = context.globalThis;
        _.console.log(__.a, __.b, __.c);
    }
};
