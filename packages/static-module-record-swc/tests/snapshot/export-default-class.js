// @ts-nocheck
export default (StaticModuleRecord)=>new StaticModuleRecord({
        bindings: [
            {
                export: "T",
                as: "default"
            }
        ],
        needsImportMeta: false,
        initialize: function(module_environment_record, import_meta, dynamic_import) {
            module_environment_record.default = class T {
            };
        }
    });
