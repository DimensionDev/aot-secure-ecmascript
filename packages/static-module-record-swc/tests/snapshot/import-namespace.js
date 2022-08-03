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
    execute: function(_) {
        _.console.log(_.a, _.b);
    }
};
