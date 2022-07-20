export default {
    needsImportMeta: true,
    execute: function(_, context) {
        context.importMeta.url;
        context.importMeta();
        context.importMeta++;
    }
};
