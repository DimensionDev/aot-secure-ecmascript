export default {
    bindings: [
        {
            export: "a"
        },
        {
            export: "b"
        },
        {
            export: "c"
        },
        {
            export: "f"
        },
        {
            export: "x1"
        },
        {
            export: "x2"
        },
        {
            export: "x3"
        }
    ],
    execute: function(_) {
        {
            var a = 1;
            _.b = _.a = a;
            function c() {
                [
                    a = 2,
                    _.b = _.a = a
                ][0];
            }
        }
        {
            for(var f = 0; f < [].length; f++){
                _.f = f;
            }
            for (f of []){
                _.f = f;
            }
            for(f in {}){
                _.f = f;
            }
        }
        let [x1, { key: x2 , ...x3 }] = (0, _.expr);
        _.x1 = x1;
        _.x2 = x2;
        _.x3 = x3;
        [
            [x1, x2, x3] = (0, _.expr2),
            _.x1 = x1,
            _.x2 = x2,
            _.x3 = x3
        ][0];
    }
};
