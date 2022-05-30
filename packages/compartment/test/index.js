import {
    Compartment,
    createModuleCache,
    createWebImportMeta,
    simpleResolveHook,
    StaticModuleRecord,
} from '../dist/index.js'
import { createRequire } from 'module'

const { modules, registerPrecompiledModules, defineByNamespace } = createModuleCache()
globalThis.registerPrecompiledModule = registerPrecompiledModules

defineByNamespace('test', {
    x() {
        return 'hi~'
    },
})

modules.set('test-2', {
    record: new StaticModuleRecord({
        initialize(env) {
            /** @type {Compartment} */
            const c = new env.Compartment({
                resolveHook: simpleResolveHook,
                globals: { console },
                moduleMap: {
                    '/index.js': { record: '/index.js' },
                    'test': { record: 'test' },
                },
            })
            c.import('/index.js')
        },
    }),
})

// load module
{
    const require = createRequire(import.meta.url)
    require('./precompiled.cjs')
}
const compartment = new Compartment({
    resolveHook: simpleResolveHook,
    importMetaHook: createWebImportMeta,
    globals: { console },
    moduleMapHook(fullSpec) {
        return modules.get(fullSpec)
    },
})
// should print "hi~"
await compartment.import('/index.js')
await compartment.import('test-2')
