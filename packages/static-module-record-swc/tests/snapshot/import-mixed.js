export default {
    bindings: [
        {
            import: "default",
            from: 'mod',
            as: "a"
        },
        {
            import: "b",
            from: 'mod'
        },
        {
            import: "default",
            from: 'mod2',
            as: "c"
        },
        {
            importAllFrom: 'mod2',
            as: "d"
        }
    ],
    execute: function(__, context) {
        var _ = context.globalThis;
        _.console.log(__.a, __.b, __.c, __.d);
    }
};
