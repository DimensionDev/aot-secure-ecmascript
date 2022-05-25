// @ts-ignore
registerPrecompiledModule('/index.js', function () {
    // @ts-ignore
    with (this.opaqueProxy) {
        with (this.globalThis) {
            with (this.globalLexicals) {
                return function () {
                    'use strict'
                    // compiled SystemJS source
                    this.register(['builtin'], function (_export, _context) {
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
                                console.log(x)
                            },
                        }
                    })
                }
            }
        }
    }
})
