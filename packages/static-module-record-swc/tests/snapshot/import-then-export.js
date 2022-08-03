export default {
    bindings: [
        {
            export: "default",
            as: "a",
            from: 'x'
        },
        {
            export: "b",
            from: 'x'
        },
        {
            export: "_",
            as: "c",
            from: 'x'
        },
        {
            exportAllFrom: 'x',
            as: "z"
        },
        {
            export: "b",
            as: "w",
            from: 'x'
        },
        {
            import: "default",
            from: 'x',
            as: "a"
        },
        {
            import: "b",
            from: 'x'
        },
        {
            import: "_",
            from: 'x',
            as: "c"
        },
        {
            importAllFrom: 'x',
            as: "z"
        }
    ],
    execute: function(_) {}
};
