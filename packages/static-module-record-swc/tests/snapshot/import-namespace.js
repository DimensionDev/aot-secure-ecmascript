export default {
    bindings: [
        {
            importAllFrom: 'a',
            as: "a"
        },
        {
            import: '*',
            from: 'b',
            as: "b"
        }
    ],
    execute: function(__, context) {
        var _ = context.globalThis;
        _.console.log(__.a, __.b);
    }
};
