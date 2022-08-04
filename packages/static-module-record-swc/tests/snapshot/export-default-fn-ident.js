export default {
    bindings: [
        {
            export: "default"
        }
    ],
    execute: function(__) {
        function x() {
            [
                x = function name() {},
                __.default = x
            ][0];
        }
        __.default = x;
    }
};
