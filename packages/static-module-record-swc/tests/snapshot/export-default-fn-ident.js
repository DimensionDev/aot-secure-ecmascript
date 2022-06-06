// @ts-nocheck
export default {
    bindings: [
        {
            export: "default"
        }
    ],
    initialize: function(_) {
        function x() {
            [
                x = function name() {},
                _.default = x
            ][0];
        }
        _.default = x;
    }
};
