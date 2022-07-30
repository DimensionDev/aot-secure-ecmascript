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
        if ((0, _.Math).random()) {
            [
                T = class T2 {
                },
                _.default = T
            ][0];
        }
    }
};
