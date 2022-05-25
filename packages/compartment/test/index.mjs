import { Compartment, createModuleLoader, StaticModuleRecord, simpleResolveHook } from '../dist/index.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const { modules, registerPrecompiledModules } = createModuleLoader()
globalThis.registerPrecompiledModule = registerPrecompiledModules
modules.set('builtin', StaticModuleRecord.of({ x() { return 'hi~' } }))
// load module
require('./precompiled.cjs')
const compartment = new Compartment(
    { console },
    {},
    {
        resolveHook: simpleResolveHook,
        async importHook(module) {
            return modules.get(module)
        },
    },
)
// should print "hi~"
const mod = await compartment.import('/index.js')
console.log(mod)
