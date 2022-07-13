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
    initialize: function(_) {
        _.console.log(_.a, _.b, _.c, _.d);
    }
};
