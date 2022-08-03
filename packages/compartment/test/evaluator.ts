import { Evaluators, imports } from '../dist/index.js'
import { expect, it } from 'vitest'

it('overrite global object in a module', async () => {
    const global = { a: undefined }
    const { Module } = new Evaluators({
        globalThis: global,
        importHook: async () => null,
        importMeta: {},
    })
    const src = static module {
        declare let a: number
        a = 1
    }
    await imports(new Module(src))
    expect(global.a).toBe(1)
})
