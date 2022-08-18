import { Module, Evaluators, imports } from '../../dist/index.js'
import { expect, it } from 'vitest'

it('can initialize top-level-await module correctly', async () => {
    const src1 = static module {
        // @ts-ignore
        import { value } from "src2"
        export const a = value
    }
    const src2 = static module {
        declare function sleep(time: number): Promise<void>
        await sleep(5)
        export const value = 1
    }
    const { Module } = new Evaluators({
        importHook: (spec) => spec === 'src2' ? mod2 : null,
        globalThis: {
            sleep: (time: number) => new Promise((resolve) => setTimeout(resolve, time)),
        }
    })
    const mod1 = new Module(src1, 'src1')
    const mod2: Module = new Module(src2, 'src2')

    const { a } = await imports(mod1)
    expect(a).toBe(1)
})
