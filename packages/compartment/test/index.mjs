import { Compartment, createModuleLoader, StaticModuleRecord } from '../dist/index.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const { modules, registerPrecompiledModules } = createModuleLoader()
globalThis.registerPrecompiledModule = registerPrecompiledModules
modules.set('builtin', StaticModuleRecord.of({ x: 1 }))

// load module
require('./precompiled.cjs')

const compartment = new Compartment(
    { console },
    {},
    {
        resolveHook(request, parent) {
            return request
        },
        async importHook(module) {
            return modules.get(module)
        },
    },
)
// should print "1"
await compartment.import('/index.js')
