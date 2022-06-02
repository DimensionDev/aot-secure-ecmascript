// @ts-nocheck
export default (StaticModuleRecord)=>new StaticModuleRecord({
        bindings: [
            {
                import: "x",
                from: 'live-test',
                as: "x"
            },
            {
                import: "setX",
                from: 'live-test',
                as: "setX"
            }
        ],
        needsImportMeta: false,
        initialize: function(_, import_meta, import_) {
            debugger;
            _.setX(1);
            _.x;
        }
    });
