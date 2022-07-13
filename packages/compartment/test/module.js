import { Module, imports, ExecutionContext } from '../dist/index.js'

async function importHook(spec, meta) {
    return null
}
/** @type {Record<string, import('../dist/index.js').SyntheticModuleRecord>} */
const modules = {
    a: {
        bindings: [{ export: 'x' }, { export: 'setX' }],
        initialize(env, context) {
            debugger
            env.x = 1
            env.setX = function (x) {
                env.x = x
            }
            env.console.log(env.globalThis)
        },
    },
}

const global = new ExecutionContext({ console })
const module = new global.Module(modules.a, importHook, {})
globalThis.mod = await imports(module)
