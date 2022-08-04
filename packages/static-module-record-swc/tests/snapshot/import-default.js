export default {
    bindings: [
        {
            import: "default",
            from: 'mod',
            as: "x"
        },
        {
            import: "default",
            from: 'mod2',
            as: "y"
        },
        {
            import: 'default',
            from: 'mod2',
            as: "z"
        }
    ],
    execute: function(__, context) {
        var _ = context.globalThis;
        _.console.log(__.x, __.y, __.z);
    }
};
