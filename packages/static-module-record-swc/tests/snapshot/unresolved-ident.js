export default {
    execute: function(_) {
        _.globalThis;
        _.window;
        function f(globalThis) {
            globalThis;
        }
        const x = {
            a: _.a
        };
    }
};
