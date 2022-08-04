"use strict";
__register("node:fs", {
    bindings: [
        {
            export: "writeFileSync"
        }
    ],
    execute: function(__) {
        function writeFileSync() {}
        __.writeFileSync = writeFileSync;
    }
});
