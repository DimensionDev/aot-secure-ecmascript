"use strict";
__register("/tests/fixture/example-callback-infer.js", {
    bindings: [
        {
            import: "writeFile",
            from: 'node:fs/promises'
        },
        {
            export: "url"
        }
    ],
    isAsync: true,
    needsImportMeta: true,
    execute: async function(_, context) {
        const url = new _.URL('./here.txt', context.importMeta.url);
        _.url = url;
        await _.writeFile(url, 'Hello World');
    }
});
