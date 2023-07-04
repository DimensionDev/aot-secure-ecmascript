export default {
    execute: function(__, context) {
        var _ = context.globalThis;
        _.globalThis;
        function f(globalThis) {
            globalThis;
        }
        const obj = {
            a: _.a
        };
        _.a = 1;
        ({ a: _.a } = {
            a: 2
        });
        [_.a, _.b] = [
            1,
            2
        ];
        ({ ..._.a } = _.expr);
        _.a *= 4;
        _.a++;
        function yy({ a = _.x }) {}
        (0, _.css)`
    body {}
`;
    }
};
