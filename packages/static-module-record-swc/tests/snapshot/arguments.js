export default {
    initialize: function(_) {
        'use strict';
        {
            function x() {
                arguments;
                const x = {
                    arguments: _.arguments
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
            _.arguments;
            const x = ()=>_.arguments;
            const y = ()=>{
                const x = {
                    arguments: _.arguments
                };
            };
        }
    }
};
