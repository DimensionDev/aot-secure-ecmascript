// @ts-nocheck
export default {
    initialize: function(_) {
        _.globalThis;
        _.window;
        function f(globalThis) {
            globalThis;
        }
        f;
    }
};
