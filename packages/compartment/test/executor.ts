import { Evaluators, imports } from '../dist/index.js'
import { describe, expect, it } from 'vitest'

describe('Evaluators', () => {
    it('overrite global object in a module', async () => {
        const global = { a: undefined }
        const env = new Evaluators({
            globalThis: global,
        })
        const src = static module {
            declare let a: number
            a = 1
        }
        await imports(
            new env.Module(src, {
                importHook: async () => null,
                importMeta: {},
            }),
        )
        expect(global.a).toBe(1)
    })
})
