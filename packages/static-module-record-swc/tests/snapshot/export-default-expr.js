export default {
    bindings: [
        {
            export: "default"
        }
    ],
    execute: function(__) {
        __.default = 1 + 1;
    }
};
