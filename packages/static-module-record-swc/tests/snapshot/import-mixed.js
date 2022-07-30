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
    execute: function(_) {
        (0, _.console).log((0, _.a), (0, _.b), (0, _.c), (0, _.d));
    }
};
