// @ts-nocheck
export default {
    bindings: [
        {
            import: "*",
            from: 'a',
            as: "a"
        },
        {
            import: '*',
            from: 'b',
            as: "b"
        }
    ],
    initialize: function(_) {
        _.console.log(_.a, _.b);
    }
};
