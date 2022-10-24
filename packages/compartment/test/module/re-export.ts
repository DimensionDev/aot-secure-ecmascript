import { Module, Evaluators, imports } from '../../src/index.js'
import { expect, it } from 'vitest'

it('can handle `export * from` correctly', async () => {
    const src1 = new ModuleSource(`export function echo() {}`)
    const src2 = new ModuleSource(`export * from 'src1'`)
    const { Module } = new Evaluators({
        importHook: (spec) => (spec === 'src1' ? mod1 : null),
        globalThis: {
            sleep: (time: number) => new Promise((resolve) => setTimeout(resolve, time)),
        },
    })
    const mod1: Module = new Module(src1, 'src1')
    const mod2: Module = new Module(src2, 'src2')

    const mod2Namespace = await imports(mod2)
    expect(mod2Namespace.echo).toBeTypeOf('function')
})

it('can handle `export * as T` all correctly', async () => {
    const src1 = new ModuleSource(`export function echo() {}`)
    const src2 = new ModuleSource(`export * as T from 'src1'`)
    const { Module } = new Evaluators({
        importHook: (spec) => (spec === 'src1' ? mod1 : null),
        globalThis: {
            sleep: (time: number) => new Promise((resolve) => setTimeout(resolve, time)),
        },
    })
    const mod1: Module = new Module(src1, 'src1')
    const mod2: Module = new Module(src2, 'src2')

    const { T } = await imports(mod2)
    expect(T.echo).toBeTypeOf('function')
})
