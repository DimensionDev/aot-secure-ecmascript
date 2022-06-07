"use strict";
__register("/index.js", {
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
    initialize: async function(_, context) {
        const url = new _.URL('./here.txt', context.importMeta.url);
        _.url = url;
        await _.writeFile(url, 'Hello World');
    }
});
