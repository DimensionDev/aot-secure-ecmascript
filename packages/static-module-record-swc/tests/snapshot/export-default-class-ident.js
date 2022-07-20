export default {
    bindings: [
        {
            export: "default"
        }
    ],
    execute: function(_) {
        class T {
        }
        _.default = T;
        if (_.Math.random()) {
            [
                T = class T2 {
                },
                _.default = T
            ][0];
        }
    }
};
