export default {
    execute: function(_) {
        'use strict';
        {
            function x() {
                arguments;
                const x = {
                    arguments: (0, _.arguments)
                };
            }
            function x1() {
                return ()=>arguments;
            }
            class T {
                f() {
                    return arguments;
                }
            }
        }
        {
            (0, _.arguments);
            const x2 = ()=>(0, _.arguments);
            x2();
            const y = ()=>{
                const x = {
                    arguments: (0, _.arguments)
                };
            };
        }
    }
};
