// @ts-nocheck
export default new StaticModuleRecord({
    bindings: [
        {
            export: "a"
        },
        {
            export: "c"
        },
        {
            export: "d"
        },
        {
            export: "e"
        }
    ],
    needsImportMeta: true,
    initialize: function(module_environment_record, import_meta, dynamic_import) {
        import_meta;
    }
});
