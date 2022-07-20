export default {
    bindings: [
        {
            export: "default"
        }
    ],
    execute: function(_) {
        _.default = 1 + 1;
    }
};
