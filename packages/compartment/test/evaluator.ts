import { Evaluators, imports } from '../src/index.js'
import { expect, it } from 'vitest'

it('can virtualize the global object', async () => {
    const global = { a: undefined }
    const { Module } = new Evaluators({
        globalThis: global,
        importHook: async () => null,
        importMeta: {},
    })
    const src = new ModuleSource(`a = 1`)
    await imports(new Module(src, ''))
    expect(global.a).toBe(1)
})

it('can inherit the import.meta', async () => {
    const { Module } = new Evaluators({
        importHook: async () => null,
        importMeta: { url: 'hello' },
    })
    const src = new ModuleSource(`export const url = import.meta.url`)
    const { url } = await imports(new Module(src, ''))
    expect(url).toBe('hello')
})

it('returns the given globalThis', () => {
    const localThis = {}
    const { globalThis } = new Evaluators({ globalThis: localThis })
    expect(globalThis).toBe(localThis)
})

it('checks the argument', () => {
    expect(() => new Evaluators({ globalThis: 1 as any })).toThrow(TypeError)
    expect(() => new Evaluators({ importHook: 1 as any })).toThrow(TypeError)
    expect(() => new Evaluators({ importMeta: 1 as any })).toThrow(TypeError)
})
