// no transform
'use strict'
{
    function x() {
        arguments
        const x = { arguments }
    }
    function x1() {
        return () => arguments
    }
    class T {
        f() {
            return arguments
        }
    }
}

// transform
{
    arguments
    const x = () => arguments
    const y = () => {
        const x = { arguments }
    }
}
