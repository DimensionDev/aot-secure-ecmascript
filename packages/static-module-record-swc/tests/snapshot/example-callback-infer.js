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
    needsImportMeta: true,
    initialize: async function(_, import_meta) {
        const url = new _.URL('./here.txt', import_meta.url);
        _.url = url;
        await _.writeFile(url, 'Hello World');
    }
});
