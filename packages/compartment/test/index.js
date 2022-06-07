import { Compartment, createModuleCache, createWebImportMeta, URLResolveHook } from '../dist/index.js'

const { moduleMap, addAlias, addModuleRecord, addNamespace } = createModuleCache()

addNamespace('/index.js', { a: 1 })
const compartment = new Compartment({
    resolveHook: URLResolveHook,
    importMetaHook: createWebImportMeta,
    globals: { console },
    moduleMap,
})
const mod = await compartment.import('/index.js')
console.log(mod)
