import {
    Compartment,
    createModuleCache,
    createWebImportMeta,
    simpleResolveHook,
    StaticModuleRecord,
} from '../dist/index.js'
import mod1 from '../../static-module-record-swc/tests/snapshot/import-and-export.js'
import mod2 from '../../static-module-record-swc/tests/snapshot/import-and-export-live.js'

const { modules } = createModuleCache()

modules.set('/index.js', { record: mod1(StaticModuleRecord) })
modules.set('live-test', { record: mod2(StaticModuleRecord) })

const compartment = new Compartment({
    resolveHook: simpleResolveHook,
    importMetaHook: createWebImportMeta,
    globals: { console },
    moduleMapHook(fullSpec) {
        return modules.get(fullSpec)
    },
})
await compartment.import('/index.js')
