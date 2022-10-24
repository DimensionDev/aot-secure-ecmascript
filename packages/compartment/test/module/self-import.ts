import { Module, Evaluators, imports } from '../../src/index.js'
import { expect, it } from 'vitest'

it('can import itself', async () => {
    const src1 = new ModuleSource(`
        // @ts-ignore
        import * as self from "self"
        // @ts-expect-error
        export { self }
    `)
    const { Module } = new Evaluators({
        importHook: () => mod1,
        globalThis: {},
    })
    const mod1: Module = new Module(src1, 'src1')

    const { self } = await imports(mod1)
    expect(self).toBeTypeOf('object')
})
