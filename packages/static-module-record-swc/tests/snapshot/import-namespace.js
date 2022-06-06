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
    initialize: function(_, import_meta, import_) {
        _.console.log(_.a, _.b);
    }
};
