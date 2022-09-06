import { Module, Evaluators, imports } from '../../dist/index.js'
import { it } from 'vitest'

it('can handle default import correctly', async () => {
    const src1 = static module {
        export default function () {}
    }
    const src2 = static module {
        // @ts-ignore
        import x from 'src1'
        x()
    }
    const { Module } = new Evaluators({
        importHook: (spec) => spec === 'src1' ? mod1 : null,
        globalThis: {}
    })
    const mod1: Module = new Module(src1, 'src1')
    const mod2: Module = new Module(src2, 'src2')

    await imports(mod2)
})

it('can handle alias import correctly', async () => {
    const src1 = static module {
        export function x() {}
    }
    const src2 = static module {
        // @ts-ignore
        import {x as y} from 'src1'
        y()
    }
    const { Module } = new Evaluators({
        importHook: (spec) => spec === 'src1' ? mod1 : null,
        globalThis: {}
    })
    const mod1: Module = new Module(src1, 'src1')
    const mod2: Module = new Module(src2, 'src2')

    await imports(mod2)
})
