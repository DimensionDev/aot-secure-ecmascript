// @ts-nocheck
__register("node:fs", {
    bindings: [
        {
            export: "writeFileSync"
        }
    ],
    initialize: function(_) {
        function writeFileSync() {}
        _.writeFileSync = writeFileSync;
    }
});
