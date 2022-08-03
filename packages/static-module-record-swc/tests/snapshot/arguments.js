export default {
    execute: function(_) {
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
