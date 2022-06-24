export default {
    initialize: function(_) {
        'use strict';
        {
            function x() {
                _.arguments;
            }
            x;
            function x1() {
                return ()=>_.arguments;
            }
            x1;
            class T {
                f() {
                    return _.arguments;
                }
            }
            T;
        }
        {
            _.arguments;
            const x = ()=>_.arguments;
            x;
        }
    }
};
