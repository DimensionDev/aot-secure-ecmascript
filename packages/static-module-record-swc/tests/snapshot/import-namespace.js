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
        (0, _.console).log((0, _.a), (0, _.b));
    }
};
