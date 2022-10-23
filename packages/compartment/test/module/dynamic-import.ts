import { type Module, Evaluators, imports } from '../../src/index.js'
import { expect, it } from 'vitest'

it('can use dynamic import', async () => {
    const src1 = new ModuleSource(`export default await import('src2')`)
    const src2 = new ModuleSource(`export const value = 1`)
    const { Module } = new Evaluators({
        importHook: (spec) => spec === 'src2' ? mod2 : null,
        globalThis: {}
    })
    const mod1 = new Module(src1, 'src1')
    const mod2: Module = new Module(src2, 'src2')

    const { default: a } = await imports(mod1)
    expect(a.value).toBe(1)
})
