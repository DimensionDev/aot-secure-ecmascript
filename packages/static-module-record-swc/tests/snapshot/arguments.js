export default {
    initialize: function(_) {
        'use strict';
        {
            function x() {
                arguments;
                const x = {
                    arguments: _.arguments
                };
                x;
            }
            x;
            function x1() {
                return ()=>arguments;
            }
            x1;
            class T {
                f() {
                    return arguments;
                }
            }
            T;
        }
        {
            _.arguments;
            const x = ()=>_.arguments;
            x;
            const y = ()=>{
                const x = {
                    arguments: _.arguments
                };
                x;
            };
            y;
        }
    }
};
