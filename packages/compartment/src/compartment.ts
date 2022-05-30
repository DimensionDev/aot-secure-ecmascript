import { makeGlobalThis } from './makeGlobalThis.js'
import {
    brandCheck_StaticModuleRecord,
    internalSlot_StaticModuleRecord_get,
    StaticModuleRecord,
} from './StaticModuleRecord.js'
import {
    PROMISE_STATE,
    type Binding,
    type CompartmentInstance,
    type CompartmentOptions,
    type ModuleCache,
    type ModuleCacheItem,
    type ModuleDescriptor,
} from './types.js'
import { normalizeModuleDescriptor } from './utils/normalize.js'
import { internalError, opaqueProxy } from './utils/opaqueProxy.js'
import {
    isExportBinding,
    isImportBinding,
    isModuleDescriptor_FullSpecReference,
    isModuleDescriptor_ModuleInstance,
    isModuleDescriptor_Source,
    isModuleDescriptor_StaticModuleRecord,
} from './utils/shapeCheck.js'
import { SystemJS } from './utils/system.js'

/** @internal */
export let brandCheck_Compartment: (compartment: Compartment) => boolean
export let internalSlot_Compartment_globalThis_get: (compartment: Compartment) => Compartment['globalThis']
export class Compartment implements CompartmentInstance {
    get globalThis() {
        return this.#globalThis
    }
    evaluate(_source: string) {
        throw new Error('Compartment: evaluate is not allowed.')
    }
    async load(fullSpec: string): Promise<void> {
        await this.#loadModuleDescriptor(fullSpec)
    }
    async import(fullSpec: string): Promise<object> {
        return this.#moduleGraph.import(fullSpec, undefined)
    }

    // implementation
    static {
        brandCheck_Compartment = (compartment: Compartment) => #globalThis in compartment
        internalSlot_Compartment_globalThis_get = (compartment: Compartment) => compartment.#globalThis
    }
    #opts: CompartmentOptions
    #incubatorCompartment?: Compartment
    #globalThis: typeof globalThis
    #moduleCache = new Map<string, ModuleCache>()
    #moduleGraph = new SystemJS()
    constructor(options: CompartmentOptions) {
        const normalizedOptions: CompartmentOptions = { resolveHook: defaultResolveHook }
        Object.setPrototypeOf(normalizedOptions, null)

        // normalize options
        if (typeof options !== 'object' || options === null)
            throw new TypeError('Compartment cannot be created without options.')
        {
            const { resolveHook, globals, importMetaHook, inherit, loadHook, moduleMap, moduleMapHook } = options

            if (inherit) throw new TypeError('Compartment: inherit cannot be true when lockdown is enabled.')
            if (moduleMapHook && typeof moduleMapHook !== 'function')
                throw new TypeError('Compartment: moduleMapHook must be a function')
            if (typeof resolveHook !== 'function') throw new TypeError('Compartment: resolveHook must be a function')
            if (importMetaHook && typeof importMetaHook !== 'function')
                throw new TypeError('Compartment: importMetaHook must be a function')
            if (loadHook && typeof loadHook !== 'function')
                throw new TypeError('Compartment: loadHook must be a function')
            if (moduleMap && typeof moduleMap !== 'object')
                throw new TypeError('Compartment: moduleMap must be an object')

            normalizedOptions.moduleMap = moduleMap
            normalizedOptions.globals = globals
            normalizedOptions.moduleMapHook = moduleMapHook
            normalizedOptions.resolveHook = resolveHook
            normalizedOptions.importMetaHook = importMetaHook
            normalizedOptions.loadHook = loadHook
        }

        // setup globalThis
        {
            const ParentCompartment = Compartment
            const parentCompartment = this
            this.#globalThis = makeGlobalThis(
                Object.prototype,
                class Compartment extends ParentCompartment {
                    constructor(options: CompartmentOptions) {
                        super(options)
                        this.#incubatorCompartment = parentCompartment
                    }
                },
                normalizedOptions.globals,
            )
        }

        this.#opts = normalizedOptions
        this.#moduleGraph.resolve = normalizedOptions.resolveHook
        this.#moduleGraph.createScript = internalError
        this.#moduleGraph.createContext = this.#createImportMeta.bind(this)
        this.#moduleGraph.instantiate = this.#instantiate.bind(this)
    }
    #createImportMeta(parentID: string): object {
        const mod = this.#moduleCache.get(parentID)
        if (!mod) internalError()
        const [status, item] = mod
        if (status === PROMISE_STATE.Pending) internalError()
        if (status === PROMISE_STATE.Err) throw item

        const importMeta = Object.create(null)
        if (item.type === 'record' && internalSlot_StaticModuleRecord_get(item.module).needImportMeta) {
            if (item.extraImportMeta) Object.assign(importMeta, item.extraImportMeta)
            if (this.#opts.importMetaHook) {
                this.#opts.importMetaHook(parentID, importMeta)
            }
        }
        return importMeta
    }
    async #loadModuleDescriptor(fullSpec: string): Promise<ModuleCacheItem> {
        if (this.#moduleCache.has(fullSpec)) {
            const [status, item] = this.#moduleCache.get(fullSpec)!
            if (status === PROMISE_STATE.Err) throw item
            return item
        } else {
            const promise = this.#loadModuleDescriptorOnce(fullSpec).then(
                (item) => {
                    cache[0] = PROMISE_STATE.Ok
                    cache[1] = item
                    return item
                },
                (error) => {
                    cache[0] = PROMISE_STATE.Err
                    cache[1] = error
                    throw error
                },
            )
            const cache: ModuleCache = [PROMISE_STATE.Pending, promise]
            this.#moduleCache.set(fullSpec, cache)
            return promise
        }
    }
    async #loadModuleDescriptorOnce(fullSpec: string): Promise<ModuleCacheItem> {
        let desc: ModuleDescriptor | undefined
        if (this.#opts.moduleMap) desc = normalizeModuleDescriptor(this.#opts.moduleMap[fullSpec])
        if (!desc && this.#opts.moduleMapHook) desc = normalizeModuleDescriptor(this.#opts.moduleMapHook(fullSpec))
        if (!desc && this.#opts.loadHook) desc = normalizeModuleDescriptor(await this.#opts.loadHook(fullSpec))

        if (!desc) throw new TypeError(`Cannot resolve module "${fullSpec}"`)

        if (isModuleDescriptor_Source(desc)) {
            throw new TypeError(`Cannot compile source file for module "${fullSpec}"`)
        } else if (isModuleDescriptor_FullSpecReference(desc)) {
            // TODO:
            internalError()
        } else if (isModuleDescriptor_ModuleInstance(desc)) {
            return { type: 'instance', moduleInstance: desc.namespace as any }
        } else if (isModuleDescriptor_StaticModuleRecord(desc)) {
            if (typeof desc.record === 'string') {
                if (!this.#incubatorCompartment) {
                    throw new TypeError(`Cannot load the StaticModuleRecord "${fullSpec}" from the top compartment.`)
                }
                return this.#incubatorCompartment.#loadModuleDescriptor(desc.record)
            } else if (brandCheck_StaticModuleRecord(desc.record)) {
                return { type: 'record', module: desc.record, extraImportMeta: desc.importMeta }
            } else {
                return { type: 'record', module: new StaticModuleRecord(desc.record), extraImportMeta: desc.importMeta }
            }
        } else {
            const _: never = desc
            internalError()
        }
    }
    async #instantiate(url: string, parentUrl: string | undefined): Promise<SystemJS.RegisterArray> {
        const fullSpec = typeof parentUrl === 'string' ? this.#opts.resolveHook(url, parentUrl) : url
        if (typeof fullSpec !== 'string') throw new TypeError(`resolveHook must return a string.`)

        const module = await this.#loadModuleDescriptor(fullSpec)
        if (module.type === 'instance') {
            // No live binding support yet.
            return [
                [],
                (_export: SystemJS.ExportFunction, _context: SystemJS.Context) => {
                    _export(module.moduleInstance)
                    return { execute() {}, setters: [] }
                },
            ]
        } else if (module.type === 'record') {
            const { initialize, initializeInternal, bindings } = internalSlot_StaticModuleRecord_get(module.module)
            if (initializeInternal) {
                let x, y
                initializeInternal
                    .call({
                        opaqueProxy,
                        globalThis: this.#globalThis,
                    })
                    .call({
                        register(a, b) {
                            ;[x, y] = [a, b]
                        },
                    })
                if (!x || !y) internalError()
                return [x, y]
            } else {
                const { imports, moduleEnvironmentProxy, setters, init } = makeModuleEnvironmentProxy(
                    bindings,
                    this.#globalThis,
                )
                return [
                    imports,
                    (_export, _context) => {
                        init(_export)
                        return {
                            execute: () => initialize(moduleEnvironmentProxy, _context.meta, _context.import),
                            setters,
                        }
                    },
                ]
            }
        } else {
            let _: never = module
            internalError()
        }
    }
}

const NAMESPACE_IMPORT = '*'
function makeModuleEnvironmentProxy(bindings: readonly Binding[], globalThis: object) {
    const imports: string[] = []
    const setters: SystemJS.SetterFunction[] = []
    let exportF: SystemJS.ExportFunction

    const importBindings = new Map<string, unknown>()
    const exportBindings = new Map<string, unknown>()
    const exportBindingMaps = new Map<string, string>()
    const modules = new Map<string, Binding[]>()
    bindings
        .filter((b) => typeof b.from === 'string')
        .forEach((b) => (modules.has(b.from!) ? modules.get(b.from!)!.push(b) : modules.set(b.from!, [b])))
    bindings
        .filter(isExportBinding)
        .filter((b) => typeof b.from === 'undefined')
        .forEach((b) => exportBindingMaps.set(b.export, b.as || b.export))

    for (const [module, bindings] of modules) {
        imports.push(module)
        setters.push((newModule) => {
            for (const binding of bindings) {
                if (isImportBinding(binding)) {
                    if (binding.import === NAMESPACE_IMPORT) {
                        if (!binding.as) throw new TypeError('Compartment: Cannot import * without an alias name.')
                        importBindings.set(binding.as, newModule)
                    } else {
                        importBindings.set(binding.as || binding.import, newModule[binding.import])
                    }
                } else {
                    if (binding.export === NAMESPACE_IMPORT) {
                        if (binding.as) exportF(binding.as, newModule)
                        else {
                            const newModuleExcludeDefault = Object.assign({}, newModule)
                            delete (newModuleExcludeDefault as any).default
                            exportF(newModuleExcludeDefault)
                        }
                    } else {
                        exportF!(binding.as || binding.export, newModule[binding.export])
                    }
                }
            }
        })
    }

    return {
        imports,
        moduleEnvironmentProxy: new Proxy(Object.freeze(Object.create(null)), {
            get(_, key) {
                if (key === Symbol.unscopables) return []
                if (typeof key !== 'string') internalError()
                if (importBindings.has(key)) return importBindings.get(key)
                if (exportBindingMaps.has(key)) return exportBindings.get(key)
                return Reflect.get(globalThis, key)
            },
            set(_, key, value) {
                if (typeof key !== 'string') internalError()
                if (importBindings.has(key)) return false
                if (exportBindingMaps.has(key)) {
                    exportF(exportBindingMaps.get(key)!, value)
                    return true
                }
                return Reflect.set(globalThis, key, value)
            },
            has(_, key) {
                if (typeof key !== 'string') internalError()
                return importBindings.has(key) || exportBindingMaps.has(key) || Reflect.has(globalThis, key)
            },
        }),
        setters,
        init: (_: SystemJS.ExportFunction) => (exportF = _),
    }
}

function defaultResolveHook(): never {
    throw new TypeError('Compartment requires a resolveHook to import modules.')
}
