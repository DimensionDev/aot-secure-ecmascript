// @ts-nocheck
export default {
    bindings: [
        {
            export: "x"
        },
        {
            export: "y"
        }
    ],
    initialize: function(_, import_meta, import_) {
        var x, y;
        _.x = x;
        _.y = y;
        for (var x of [
            1,
            2
        ]){
            _.x = x;
            _.console.log(x);
        }
        {
            for ([x, y] of [
                [
                    1,
                    2
                ],
                [
                    2,
                    3
                ], 
            ]){
                _.x = x;
                _.y = y;
                _.console.log(x);
            }
        }
        for(x in {
            x: 1
        }){
            _.x = x;
        }
        for([
            x = 0,
            _.x = x
        ][0]; x < [
            1,
            2,
            3
        ].length; x++, _.x = x){
            _.console.log(x);
        }
    }
};
