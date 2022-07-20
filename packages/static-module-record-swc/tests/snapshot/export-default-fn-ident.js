export default {
    bindings: [
        {
            export: "default"
        }
    ],
    execute: function(_) {
        function x() {
            [
                x = function name() {},
                _.default = x
            ][0];
        }
        _.default = x;
    }
};
