// @ts-nocheck
export default {
    bindings: [
        {
            export: "default"
        }
    ],
    initialize: function(_, import_meta, import_) {
        function x() {
            [
                x = function name() {},
                _.default = x
            ][0];
        }
        _.default = x;
    }
};
