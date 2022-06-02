// @ts-nocheck
export default new StaticModuleRecord({
    bindings: [
        {
            import: "utils",
            from: 'host',
            as: "utils"
        },
        {
            export: "init",
            as: "default"
        },
        {
            export: "item"
        },
        {
            export: "add"
        }
    ],
    needsImportMeta: false,
    initialize: function(_, import_meta, import_) {
        _.console.log(_.utils);
        function init() {
            _.utils.ready.then((f)=>{
                [
                    init = f,
                    _.default = init
                ][0];
            });
            throw _.utils.ready;
        }
        _.default = init;
        let item = 0;
        _.item = item;
        function add() {
            item++, _.item = item;
        }
        _.add = add;
    }
});