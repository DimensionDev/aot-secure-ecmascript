import { Module, imports, ExecutionContext } from '../dist/index.js'

async function importHook(spec, meta) {
    if (spec === 'b') return new Module(modules.b, importHook, {})
    if (spec === 'c') return new Module(modules.b, importHook, {})
    if (spec == 'undefined') debugger
}
/** @type {Record<string, import('../dist/index.js').SyntheticModuleRecord>} */
const modules = {
    a: {
        bindings: [{ exportAllFrom: 'c' }],
        initialize(env, context) {},
    },
    b: {
        bindings: [{ export: 'x' }],
        initialize(env, context) {},
    },
}

const module = new Module(modules.a, importHook, {})
await imports(module)
