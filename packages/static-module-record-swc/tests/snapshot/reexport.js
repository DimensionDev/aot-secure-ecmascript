export default {
    bindings: [
        {
            exportAllFrom: 'mod'
        },
        {
            exportAllFrom: 'mod2',
            as: "x2"
        },
        {
            export: "default",
            from: 'mod3'
        },
        {
            export: "default",
            as: "x3",
            from: 'mod3'
        },
        {
            export: "some export",
            as: "x4",
            from: 'mod3'
        },
        {
            export: "x5",
            from: 'mod3'
        }
    ],
    initialize: function(_) {}
};
