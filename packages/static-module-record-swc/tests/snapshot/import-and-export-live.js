// @ts-nocheck
export default {
    bindings: [
        {
            export: "x"
        },
        {
            export: "y"
        },
        {
            export: "x",
            as: "z"
        },
        {
            export: "setX"
        }
    ],
    initialize: function(_, import_meta, import_) {
        let x, y;
        _.z = _.x = x;
        _.y = y;
        function setX(value) {
            [
                x = value,
                _.z = _.x = x
            ][0];
        }
        _.setX = setX;
        function setAll() {
            [
                [x, y] = [
                    1,
                    2,
                    3
                ],
                _.z = _.x = x,
                _.y = y
            ][0];
        }
        setAll;
    }
};
