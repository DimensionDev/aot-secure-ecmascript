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
    execute: function(_) {
        (0, _.console).log((0, _.x), (0, _.y), (0, _.z));
    }
};
