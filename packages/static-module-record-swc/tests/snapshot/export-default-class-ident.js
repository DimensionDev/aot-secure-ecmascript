// @ts-nocheck
export default {
    bindings: [
        {
            export: "default"
        }
    ],
    initialize: function(_, import_meta, import_) {
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
