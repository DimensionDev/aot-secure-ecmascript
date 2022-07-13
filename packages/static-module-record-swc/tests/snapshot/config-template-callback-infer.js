"use strict";
__register("/tests/fixture/config-template-callback-infer.js", {
    isAsync: true,
    initialize: async function(_) {
        await 1;
    }
});
