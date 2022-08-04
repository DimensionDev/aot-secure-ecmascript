export default {
    needsImportMeta: true,
    execute: function(__, context) {
        context.importMeta.url;
        context.importMeta();
        context.importMeta++;
    }
};
