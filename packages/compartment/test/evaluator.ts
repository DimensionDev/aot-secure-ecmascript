import { Evaluators, imports } from '../dist/index.js'
import { expect, it } from 'vitest'

it('can virtualize the global object', async () => {
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

it('can inherit the import.meta', async () => {
    const { Module } = new Evaluators({
        importHook: async () => null,
        importMeta: { url: "hello" },
    })
    const src = static module {
        export const url = import.meta.url
    }
    const { url } = await imports(new Module(src))
    expect(url).toBe("hello")
})
