export default {
    bindings: [
        {
            export: "default"
        }
    ],
    execute: function(__, context) {
        var _ = context.globalThis;
        class T {
        }
        __.default = T;
        if (_.Math.random()) {
            [
                T = class T2 {
                },
                __.default = T
            ][0];
        }
    }
};
