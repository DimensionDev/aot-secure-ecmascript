import { Evaluators, imports } from '../src/index.js'
import { describe, expect, it } from 'vitest'

describe('Evaluators', () => {
    it('overrite global object in a module', async () => {
        const global = { a: undefined }
        const env = new Evaluators({
            globalThis: global,
        })
        await imports(
            new env.Module(
                {
                    execute(env) {
                        env.a = 1
                    },
                },
                {
                    importHook: async () => null,
                    importMeta: {},
                },
            ),
        )
        expect(global.a).toBe(1)
    })
})
