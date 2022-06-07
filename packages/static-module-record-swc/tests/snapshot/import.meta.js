export default {
    needsImportMeta: true,
    initialize: function(_, context) {
        context.importMeta.url;
        context.importMeta();
        context.importMeta++;
    }
};
