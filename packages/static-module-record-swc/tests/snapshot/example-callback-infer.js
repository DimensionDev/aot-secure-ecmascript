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
    execute: async function(__, context) {
        var _ = context.globalThis;
        const url = new _.URL('./here.txt', context.importMeta.url);
        __.url = url;
        await (0, __.writeFile)(url, 'Hello World');
    }
});
