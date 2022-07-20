export default {
    bindings: [
        {
            export: "default"
        }
    ],
    execute: function(_) {
        _.default = class {
        };
    }
};
