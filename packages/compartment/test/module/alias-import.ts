import { Module, Evaluators, imports } from '../../src/index.js'
import { it } from 'vitest'

it('can handle default import correctly', async () => {
    const src1 = new ModuleSource(`export default function () {}`)
    const src2 = new ModuleSource(`
        import x from 'src1'
        x()
    `)
    const { Module } = new Evaluators({
        importHook: (spec) => (spec === 'src1' ? mod1 : null),
        globalThis: {},
    })
    const mod1: Module = new Module(src1, 'src1')
    const mod2: Module = new Module(src2, 'src2')

    await imports(mod2)
})

it('can handle alias import correctly', async () => {
    const src1 = new ModuleSource(`export function x() {}`)
    const src2 = new ModuleSource(`
        import { x as y } from 'src1'
        y()
    `)
    const { Module } = new Evaluators({
        importHook: (spec) => (spec === 'src1' ? mod1 : null),
        globalThis: {},
    })
    const mod1: Module = new Module(src1, 'src1')
    const mod2: Module = new Module(src2, 'src2')

    await imports(mod2)
})
