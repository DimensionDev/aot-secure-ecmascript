import { Compartment, createModuleCache, simpleResolveHook } from '../dist/index.js'
import { createRequire } from 'module'


const { modules, registerPrecompiledModules, defineByNamespace } = createModuleCache()
globalThis.registerPrecompiledModule = registerPrecompiledModules

defineByNamespace('test', {
    x() {
        return 'hi~'
    },
})

// load module
{
    const require = createRequire(import.meta.url)
    require('./precompiled.cjs')
}
const compartment = new Compartment({
    resolveHook: simpleResolveHook,
    globals: { console },
    moduleMapHook(fullSpec) {
        return modules.get(fullSpec)
    },
})
// should print "hi~"
const mod = await compartment.import('/index.js')
console.log(mod)
