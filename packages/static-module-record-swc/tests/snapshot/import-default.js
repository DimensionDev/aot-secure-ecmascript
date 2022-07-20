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
        _.console.log(_.x, _.y, _.z);
    }
};
