import { Compartment, createModuleCache, createWebImportMeta, simpleResolveHook } from '../dist/index.js'
import mod1 from '../../static-module-record-swc/tests/snapshot/import-and-export.js'
import mod2 from '../../static-module-record-swc/tests/snapshot/import-and-export-live.js'

const { modules } = createModuleCache()

modules.set('/index.js', { record: mod1 })
modules.set('live-test', { record: mod2 })

const compartment = new Compartment({
    resolveHook: simpleResolveHook,
    importMetaHook: createWebImportMeta,
    globals: { console },
    moduleMapHook(fullSpec) {
        return modules.get(fullSpec)
    },
})
await compartment.import('/index.js')
