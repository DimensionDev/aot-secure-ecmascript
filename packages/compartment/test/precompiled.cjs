registerPrecompiledModule('/index.js', [{ import: 'x', from: 'test' }, { export: 'a' }], true, function () {
    // @ts-ignore
    with (this.opaqueProxy) {
        with (this.globalThis) {
            return function () {
                'use strict'
                // compiled SystemJS source
                this.register(['test'], function (_export, _context) {
                    'use strict'
                    var x, a
                    return {
                        setters: [
                            function (_builtin) {
                                x = _builtin.x
                            },
                        ],
                        execute: async function () {
                            await Promise.resolve()
                            _export('a', (a = x))
                            console.log(x, x())
                        },
                    }
                })
            }
        }
    }
})
