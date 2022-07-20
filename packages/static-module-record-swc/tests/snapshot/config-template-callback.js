"use strict";
__register("node:fs", {
    bindings: [
        {
            export: "writeFileSync"
        }
    ],
    execute: function(_) {
        function writeFileSync() {}
        _.writeFileSync = writeFileSync;
    }
});
