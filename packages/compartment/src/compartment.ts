import { makeBorrowedGlobalThis, makeGlobalThis } from './utils/makeGlobalThis.js'
import type {
    Binding,
    CompartmentInstance,
    CompartmentOptions,
    ModuleCacheItem,
    ModuleDescriptor,
    VirtualModuleRecordExecuteContext,
} from './types.js'
import { normalizeModuleDescriptor } from './utils/normalize.js'
import { internalError, unreachable } from './utils/assert.js'
import {
    hasFromField,
    isExportAllBinding,
    isExportBinding,
    isImportAllBinding,
    isImportBinding,
    isModuleDescriptor_FullSpecReference,
    isModuleDescriptor_ModuleInstance,
    isModuleDescriptor_Source,
    isModuleDescriptor_StaticModuleRecord,
    isReExportBinding,
} from './utils/shapeCheck.js'
import { SystemJS } from './utils/system.js'
import { createModuleSubclass } from './Module.js'
import { PromiseCapability } from './utils/spec.js'
import { ModuleSource } from './ModuleSource.js'

/** @internal */
export let brandCheck_Compartment: (compartment: Compartment) => boolean
export let internalSlot_Compartment_globalThis_get: (compartment: Compartment) => Compartment['globalThis']

/** @deprecated Need a rewrite based on Module & Evaluators. */
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
    // Safari: static init block
    static _: any = (() => {
        // Safari: private in
        brandCheck_Compartment = (compartment: Compartment) => {
            try {
                compartment.#globalThis
                return true
            } catch {
                return false
            }
        }
        internalSlot_Compartment_globalThis_get = (compartment: Compartment) => compartment.#globalThis
    })()
    #opts: CompartmentOptions
    #incubatorCompartment?: Compartment
    #globalThis: typeof globalThis
    #moduleCache = new Map<string, PromiseCapability<ModuleCacheItem>>()
    #moduleGraph = new SystemJS()
    constructor(options: CompartmentOptions) {
        const normalizedOptions: CompartmentOptions = { resolveHook: defaultResolveHook }
        Object.setPrototypeOf(normalizedOptions, null)

        // normalize options
        if (typeof options !== 'object' || options === null)
            throw new TypeError('Compartment cannot be created without options.')
        {
            const { resolveHook, globals, importMetaHook, borrowGlobals, loadHook, moduleMap } = options

            if (typeof resolveHook !== 'function') throw new TypeError('Compartment: resolveHook must be a function')
            if (importMetaHook && typeof importMetaHook !== 'function')
                throw new TypeError('Compartment: importMetaHook must be a function')
            if (loadHook && typeof loadHook !== 'function')
                throw new TypeError('Compartment: loadHook must be a function')
            if (moduleMap && typeof moduleMap !== 'object')
                throw new TypeError('Compartment: moduleMap must be an object')

            normalizedOptions.borrowGlobals = Boolean(borrowGlobals)
            normalizedOptions.moduleMap = moduleMap
            normalizedOptions.globals = globals
            normalizedOptions.resolveHook = resolveHook
            normalizedOptions.importMetaHook = importMetaHook
            normalizedOptions.loadHook = loadHook
        }

        // setup globalThis
        {
            const ParentCompartment = Compartment
            const parentCompartment = this
            const Subcompartment = class Compartment extends ParentCompartment {
                constructor(options: CompartmentOptions) {
                    super(options)
                    this.#incubatorCompartment = parentCompartment
                }
            }
            this.#globalThis = normalizedOptions.borrowGlobals
                ? makeBorrowedGlobalThis(Subcompartment, this.#incubatorCompartment?.globalThis ?? globalThis)
                : makeGlobalThis(
                      Object.prototype,
                      {
                          createModule: createModuleSubclass,
                      },
                      normalizedOptions.globals,
                  )
            Object.defineProperty(this.#globalThis, 'Compartment', {
                configurable: true,
                writable: true,
                value: Subcompartment,
            })
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
        if (mod.Status.Type === 'Pending') internalError()
        if (mod.Status.Type === 'Rejected') throw mod.Status.Reason

        const importMeta = Object.create(null)
        const item = mod.Status.Value
        if (item.type === 'record' && item.module.needsImportMeta) {
            if (item.extraImportMeta) Object.assign(importMeta, item.extraImportMeta)
            if (this.#opts.importMetaHook) {
                this.#opts.importMetaHook(parentID, importMeta)
            }
        }
        return importMeta
    }
    #loadModuleDescriptor(fullSpec: string): Promise<ModuleCacheItem> {
        if (this.#moduleCache.has(fullSpec)) {
            return this.#moduleCache.get(fullSpec)!.Promise
        } else {
            const capability = PromiseCapability<ModuleCacheItem>()
            Promise.resolve(this.#loadModuleDescriptorOnce(fullSpec)).then(capability.Resolve, capability.Reject)
            this.#moduleCache.set(fullSpec, capability)
            return capability.Promise
        }
    }

    async #loadModuleDescriptorOnce(fullSpec: string): Promise<ModuleCacheItem> {
        let desc: ModuleDescriptor | undefined
        if (this.#opts.moduleMap) desc = normalizeModuleDescriptor(this.#opts.moduleMap[fullSpec])
        if (!desc && this.#opts.loadHook) desc = normalizeModuleDescriptor(await this.#opts.loadHook(fullSpec))

        if (!desc) throw new TypeError(`Cannot resolve module "${fullSpec}"`)

        if (isModuleDescriptor_Source(desc)) {
            throw new TypeError(`Cannot compile source file for module "${fullSpec}"`)
        } else if (isModuleDescriptor_FullSpecReference(desc)) {
            const { instance, compartment } = desc
            const target = compartment || this
            // TODO: throw when this kind of reference builds a cycle
            return target.#loadModuleDescriptor(instance)
        } else if (isModuleDescriptor_ModuleInstance(desc)) {
            return { type: 'instance', moduleInstance: desc.namespace as any }
        } else if (isModuleDescriptor_StaticModuleRecord(desc)) {
            if (typeof desc.record === 'string') {
                if (!this.#incubatorCompartment) {
                    throw new TypeError(`Cannot load the StaticModuleRecord "${fullSpec}" from the top compartment.`)
                }
                return this.#incubatorCompartment.#loadModuleDescriptor(desc.record)
            } else if (desc.record instanceof ModuleSource) {
                throw new TypeError('ModuleSource is not supported.')
            } else {
                return { type: 'record', module: desc.record, extraImportMeta: desc.importMeta }
            }
        } else unreachable(desc)
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
            const { execute, bindings = [], needsImport, needsImportMeta } = module.module

            const { imports, moduleEnvironmentProxy, setters, init } = makeModuleEnvironmentProxy(
                bindings,
                this.#globalThis,
            )

            return [
                imports,
                (_export, _context) => {
                    const context: VirtualModuleRecordExecuteContext = { globalThis: this.#globalThis }
                    if (needsImport) context!.import = _context.import
                    if (needsImportMeta) context!.importMeta = _context.meta

                    init(_export)
                    return {
                        execute: () => execute?.(moduleEnvironmentProxy, context),
                        setters,
                    }
                },
            ]
        } else unreachable(module)
    }
}
delete Compartment._

function makeModuleEnvironmentProxy(bindings: readonly Binding[], globalThis: object) {
    const systemImports: string[] = []
    const systemSetters: SystemJS.SetterFunction[] = []
    let systemExport: SystemJS.ExportFunction

    // categorize bindings by module name, so our work will be easier later.
    const modules = new Map<string, Binding[]>()
    for (const b of bindings) {
        let from: string | undefined
        if (isImportBinding(b) || isReExportBinding(b)) {
            from = b.from
        } else if (isImportAllBinding(b)) {
            from = b.importAllFrom
        } else if (isExportAllBinding(b)) {
            from = b.exportAllFrom
        }
        if (from === undefined) continue
        modules.has(from) ? modules.get(from)!.push(b) : modules.set(from, [b])
    }

    // Scope order: Export & Imports > GlobalThis

    // here we initialize the initial import(TDZ)/export bindings for importExportLexical
    const importExportLexical = Object.create(
        globalThis,
        Object.fromEntries(
            bindings
                .map((binding): [string, PropertyDescriptor] => {
                    // TDZ for import bindings.
                    if (isImportAllBinding(binding)) {
                        return [binding.as!, { configurable: true, get: internalError }]
                    } else if (isImportBinding(binding)) {
                        return [binding.as ?? binding.import, { configurable: true, get: internalError }]
                    } else if (isExportAllBinding(binding)) {
                        return undefined!
                    } else if (isExportBinding(binding)) {
                        if (hasFromField(binding)) return undefined!
                        const exportName = binding.as ?? binding.export
                        let value: any
                        return [
                            exportName,
                            {
                                get: () => value,
                                set: (v) => {
                                    value = v
                                    systemExport(exportName, v)
                                    return true
                                },
                            },
                        ]
                    } else unreachable(binding)
                })
                .filter(Boolean),
        ),
    )

    for (const [module, bindings] of modules) {
        systemImports.push(module)
        systemSetters.push((module) => {
            for (const binding of bindings) {
                if (isImportAllBinding(binding)) {
                    Object.defineProperty(importExportLexical, binding.as!, { configurable: true, value: module })
                } else if (isImportBinding(binding)) {
                    // update live binding
                    if (Reflect.getOwnPropertyDescriptor(module, binding.import)) {
                        Object.defineProperty(importExportLexical, binding.as ?? binding.import, {
                            configurable: true,
                            value: module[binding.import],
                        })
                    }
                } else if (isExportAllBinding(binding)) {
                    // export * from 'mod'
                    // export * as name from 'mod'
                    if (typeof binding.as === 'string') systemExport(binding.as, module)
                    else {
                        const items = Object.assign({}, module)
                        delete (items as any).default
                        systemExport(items)
                    }
                } else if (isExportBinding(binding)) {
                    // export { a as b } from 'mod' (export = a, as = b)
                    if (Reflect.getOwnPropertyDescriptor(module, binding.export)) {
                        systemExport(binding.as ?? binding.export, module[binding.export])
                    }
                }
            }
        })
    }

    // Only [[Get]] and [[Set]] is allowed.
    const moduleEnvironmentProxy = new Proxy(importExportLexical, {
        getOwnPropertyDescriptor: internalError,
        defineProperty: internalError,
        deleteProperty: internalError,
        getPrototypeOf: internalError,
        has: internalError,
        isExtensible: internalError,
        ownKeys: internalError,
        preventExtensions: internalError,
        setPrototypeOf: internalError,
        apply: internalError,
        construct: internalError,
    })

    return {
        imports: systemImports,
        moduleEnvironmentProxy,
        setters: systemSetters,
        init: (_: SystemJS.ExportFunction) => (systemExport = _),
    }
}

function defaultResolveHook(): never {
    throw new TypeError('Compartment requires a resolveHook to import modules.')
}
