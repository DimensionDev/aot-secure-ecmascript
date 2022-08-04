export default {
    execute: function(__, context) {
        var _ = context.globalThis;
        'use strict';
        {
            function x1() {
                arguments;
                const x = {
                    arguments
                };
            }
            function x11() {
                return ()=>arguments;
            }
            class T {
                f() {
                    return arguments;
                }
            }
        }
        {
            _.arguments;
            const x = ()=>_.arguments;
            x();
            const y = ()=>{
                const x = {
                    arguments: _.arguments
                };
            };
        }
    }
};
