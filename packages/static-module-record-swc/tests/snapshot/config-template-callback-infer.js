"use strict";
__register("/tests/fixture/config-template-callback-infer.js", {
    isAsync: true,
    execute: async function(__) {
        await 1;
    }
});
