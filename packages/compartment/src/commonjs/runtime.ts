import { imports, Module } from '../Module.js'
import type {
    ExportBinding,
    ImportHook,
    ImportMetaHook,
    VirtualModuleRecord,
    VirtualModuleRecordExecuteContext,
} from '../types.js'
import { normalizeVirtualModuleRecord } from '../utils/normalize.js'
import { isExportAllBinding, isImportAllBinding, isImportBinding, isReExportBinding } from '../utils/shapeCheck.js'

// an commonjs object might be used across multiple commonjs modules (module.exports = require('...'))
// when this assignment appears, we add the relationship so we can update ES Module exports later
const commonjsExportsLink = new WeakMap<object, Set<CommonJSModule>>()

export let requires: (module: CommonJSModule) => any
export type RequireHook = (specifier: string) => CommonJSModule | null
export interface CommonJSHandler {
    requireHook?: RequireHook | undefined
    import?: ImportHook
    globalThis: typeof globalThis
}
export class CommonJSModule {
    constructor(id: string, source: VirtualModuleRecord, handler: CommonJSHandler) {
        Object.defineProperties(this, {
            id: { enumerable: true, value: String(id) },
            exports: {
                enumerable: true,
                get: () => this.#exports,
                set: (value) => {
                    commonjsExportsLink.get(this.#exports)?.delete(this)
                    this.#exports = value
                    commonjsExportsLink.get(this.#exports)?.add(this)
                    this.#updateSyntheticExports()
                },
            },
        })

        this.#source = normalizeVirtualModuleRecord(source)
        if (!isValidCommonJSReflectionModule(this.#source)) {
            throw new TypeError('CommonJS module source must be a valid reflection module')
        }

        const { globalThis, requireHook, import: importHook } = handler
        if (typeof globalThis !== 'object') throw new TypeError('globalThis must be an object')
        this.#globalThis = globalThis

        if (requireHook !== undefined && typeof requireHook !== 'function')
            throw new TypeError('requireHook must be a function')
        this.#requireHook = requireHook

        if (importHook !== undefined && typeof importHook !== 'function')
            throw new TypeError('importHook must be a function')
        this.#importHook = importHook

        const self = this
        this.#lexicals = {
            module: this,
            __filename: this.id,
            require: (path) => this.#require(path),
            get exports() {
                return self.#exports
            },
        }
    }
    declare readonly id: string
    declare exports: any
    /**
     * Create a CommonJS from an object.
     * @example
     * CommonJSModule.of(require('fs'))
     */
    static of(exports: any) {
        const exportList = Object.keys(exports)
        const module = new CommonJSModule(
            '',
            {
                bindings: exportList.map((key): ExportBinding => ({ export: key })).concat({ export: 'default' }),
                needsImportMeta: true,
                execute(environment, context) {
                    const [{ module }, skip] = ((context.importMeta as any).commonjs as CommonJSInitialize)(
                        (value) => (environment.default = value),
                        Object.fromEntries(exportList.map((key) => [key, (value) => (environment[key] = value)])),
                    )
                    if (!skip) module.exports = exports
                },
            },
            { globalThis },
        )
        module.#execute()
        return module
    }
    get asESModule() {
        if (this.#ESModule) return this.#ESModule
        this.#ESModule = new Module(this.#source, {
            importHook: this.#importHook,
            importMetaHook: (meta) => {
                Object.assign(meta, {
                    commonjs: ((a, b) => this.#commonjs(a, b, this.#evaluated, true)) as CommonJSInitialize,
                })
            },
        })
        return this.#ESModule
    }

    // Implementation details below
    #evaluated = false
    #ESModule: Module | undefined
    #exports: any = CommonJSModule.#createCommonJsNamespaceObject(this)
    #source: VirtualModuleRecord
    readonly #requireHook: RequireHook | undefined
    readonly #importHook: CommonJSHandler['import'] | undefined
    readonly #globalThis: typeof globalThis
    #LoadedModules = new Map<string, CommonJSModule>()
    #require(id: string) {
        id = String(id)
        if (!this.#LoadedModules.has(id)) {
            if (!this.#requireHook) throw new Error(`Cannot find module '${id}'`)
            const module = this.#requireHook(id)
            if (!module || !module.#LoadedModules) throw new Error('Invalid module returned from requireHook')
            this.#LoadedModules.set(id, module)
        }
        return this.#LoadedModules.get(id)!.#execute()
    }
    #execute() {
        if (this.#evaluated) return this.#exports
        this.#evaluated = true
        const { execute, needsImport } = this.#source
        const context: VirtualModuleRecordExecuteContext = {
            globalThis: this.#globalThis,
            importMeta: {
                commonjs: ((a, b) => this.#commonjs(a, b, false, false)) as CommonJSInitialize,
            },
        }
        if (needsImport)
            context.import = async (spec) => {
                spec = String(spec)
                const hook = this.#importHook
                if (!hook) throw new Error('importHook is not defined')
                const module = await hook(spec)
                if (!module) throw new Error(`Module ${spec} not found`)
                return imports(module)
            }

        try {
            execute!({}, context)
            return this.#exports
        } finally {
            this.#lexicals = null
        }
    }
    // Only be set after this module is imported as a ES Module
    #defaultReflect: CommonJSExportReflect | undefined
    // Only be set after this module is imported as a ES Module
    #namedExportReflects: Map<string, CommonJSExportReflect> | undefined
    // set to null after evaluation
    #lexicals: CommonJSGlobalLexicals | null
    #commonjs(
        defaultReflect: CommonJSExportReflect,
        namedReflects: Record<string, CommonJSExportReflect>,
        skipEvaluation: boolean,
        syntheticExport: boolean,
    ): [lexicals: CommonJSGlobalLexicals, skipEvaluation: boolean] {
        // this module has been already evaluated
        if (syntheticExport) {
            this.#defaultReflect = defaultReflect
            this.#namedExportReflects = new Map()
            try {
                for (const [key, value] of Object.entries(namedReflects)) {
                    if (typeof value !== 'function') continue
                    this.#namedExportReflects.set(key, value)
                }
            } catch {}
            if (skipEvaluation) this.#updateSyntheticExports()
        }
        if (!this.#lexicals) return [{} as any, true]
        return [this.#lexicals, skipEvaluation]
    }
    #updateSyntheticExports() {
        if (!this.#defaultReflect || !this.#namedExportReflects) return
        tryApply(this.#defaultReflect, this.#exports)
        for (const [key, value] of this.#namedExportReflects) {
            tryApply(value, this.#exports[key])
        }
    }
    static #updateNamedExport(namespaceObject: object, key: PropertyKey) {
        if (typeof key !== 'string') return
        const links = commonjsExportsLink.get(namespaceObject)
        if (!links) return
        for (const module of links) {
            if (!module.#namedExportReflects) continue
            const reflect = module.#namedExportReflects.get(key)
            if (!reflect) continue
            tryApply(reflect, (namespaceObject as any)[key])
        }
    }
    static #createCommonJsNamespaceObject(initialModule: CommonJSModule) {
        const proxy = new Proxy(
            {},
            {
                defineProperty(target, property, attributes) {
                    const result = Reflect.defineProperty(target, property, attributes)
                    CommonJSModule.#updateNamedExport(proxy, property)
                    return result
                },
                deleteProperty(target, p) {
                    const result = Reflect.deleteProperty(target, p)
                    CommonJSModule.#updateNamedExport(proxy, p)
                    return result
                },
                set(target, p, newValue, receiver) {
                    const result = Reflect.set(target, p, newValue, receiver)
                    CommonJSModule.#updateNamedExport(proxy, p)
                    return result
                },
            },
        )
        commonjsExportsLink.set(proxy, new Set([initialModule]))
        return proxy
    }
    static {
        requires = (module) => module.#execute()
    }
}

export type CommonJSInitialize = (
    exportDefaultReflect: CommonJSExportReflect,
    exportsReflect: Record<string, CommonJSExportReflect>,
) => [lexicals: CommonJSGlobalLexicals, skipEvaluation: boolean]
export type CommonJSExportReflect = (value: any) => void
export interface CommonJSGlobalLexicals {
    module: CommonJSModule
    readonly exports: object
    require: (specifier: string) => any
    __filename: string
    __dirname?: string
}

function tryApply(f: CommonJSExportReflect, x: any) {
    try {
        f(x)
    } catch {}
}

function isValidCommonJSReflectionModule(module: VirtualModuleRecord) {
    if (!module.needsImportMeta || !module.execute || module.isAsync || !module.bindings?.length) return false
    const invalidBinding = module.bindings.find((binding) => {
        return (
            isImportAllBinding(binding) ||
            isImportBinding(binding) ||
            isExportAllBinding(binding) ||
            isReExportBinding(binding)
        )
    })
    if (invalidBinding) return false
    return (module.bindings as ExportBinding[]).find((x) => x.export === 'default')
}
