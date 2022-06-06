export default {
    bindings: [
        {
            export: "default"
        }
    ],
    initialize: function(_) {
        _.default = 1 + 1;
    }
};
