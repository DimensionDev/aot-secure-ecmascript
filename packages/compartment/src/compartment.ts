import { makeGlobalThis } from './makeGlobalThis.js'
import type { StaticModuleRecord } from './StaticModuleRecord.js'
import { SystemJS } from './utils/system.js'

/** @internal */
export type CompartmentInternalSlots = {
    globalLexicals: object
    globalThis: object
}
/** @internal */
export let getInternalSlots: (compartment: Compartment) => CompartmentInternalSlots
export class Compartment {
    static {
        getInternalSlots = (compartment) => {
            return {
                globalLexicals: compartment.#globalLexicals,
                globalThis: compartment.#globalThis,
                name: compartment.#name,
            }
        }
    }
    #globalThis: typeof globalThis
    #globalLexicals: object = Object.create(null)
    #name = '<unknown>'
    #moduleGraph = new SystemJS()
    constructor(
        endowments?: Record<PropertyKey, unknown>,
        _modules?: undefined | null | Record<string, unknown>,
        _options?: CompartmentOptions,
    ) {
        let resolve: CompartmentOptions['resolveHook'] = defaultResolveHook
        let moduleMap: CompartmentOptions['moduleMapHook'] = undefined
        let dynamicImport: CompartmentOptions['importHook'] = undefined

        if (typeof _options === 'object') {
            const { name, transforms, globalLexicals, importHook, moduleMapHook, resolveHook } = _options

            if (transforms) throw new TypeError('Compartment: transforms is not supported')

            if (typeof globalLexicals === 'object' && globalLexicals !== null) {
                this.#globalLexicals = globalLexicals
            } else if (globalLexicals !== undefined) {
                throw new TypeError('Compartment: globalLexicals must be an object')
            }

            if (importHook && typeof importHook !== 'function')
                throw new TypeError('Compartment: importHook must be a function')
            if (moduleMapHook && typeof moduleMapHook !== 'function')
                throw new TypeError('Compartment: moduleMapHook must be a function')
            if (resolveHook && typeof resolveHook !== 'function')
                throw new TypeError('Compartment: resolveHook must be a function')

            resolve = resolveHook
            moduleMap = moduleMapHook
            dynamicImport = importHook
            this.#name = String(name)
        }

        this.#globalThis = makeGlobalThis(Object.prototype, endowments)

        Object.defineProperties(this.#moduleGraph, {
            resolve: { configurable: true, writable: true, value: resolve || defaultResolveHook },
            createContext: { configurable: true, writable: true, value: createImportMeta },
            createScript: { configurable: true, writable: true, value: internalError },
            instantiate: {
                configurable: true,
                writable: true,
                value: async (url: string, parentUrl: string) => {
                    const finalURL = this.#moduleGraph.resolve(url, parentUrl)
                    if (typeof finalURL !== 'string') throw new TypeError('resolveHook must return a string')
                    let record: StaticModuleRecord
                    if (!moduleMap && !dynamicImport) {
                        throw new TypeError(
                            'To import a module in the compartment, you should either provide a moduleMapHook or an importHook',
                        )
                    }
                    if (moduleMap) record = moduleMap(finalURL)
                    if (!record! && dynamicImport) record = await dynamicImport(finalURL)

                    if (!record!)
                        throw new Error(`Cannot load module "${finalURL}" in ${this.#name}`)

                    return record.init(this)
                },
            },
        })
    }
    // Should be rejected by CSP.
    evaluate(source: string) {
        return this.#globalThis.eval(source)
    }
    get globalThis(): typeof globalThis {
        return this.#globalThis
    }
    import(moduleSpecifier: string): Promise<object> {
        return this.#moduleGraph.import(moduleSpecifier, '')
    }
    importNow(moduleSpecifier: string): object {
        throw new TypeError('TODO')
    }
    load(moduleSpecifier: string): Promise<object> {
        throw new TypeError('This implementation of compartment fully relies on the import hook.')
    }
    module(moduleSpecifier: string): StaticModuleRecord {
        throw new TypeError('TODO')
    }
    get name() {
        return this.#name
    }
}
export interface CompartmentOptions {
    name?: string
    resolveHook?(moduleSpecifier: string, moduleReferrer: string): string
    importHook?(moduleSpecifier: string): Promise<StaticModuleRecord>
    moduleMapHook?(moduleSpecifier: string): StaticModuleRecord
    // Not supported since no runtime evaluator is available
    transforms?: never
    globalLexicals?: object
}

function defaultResolveHook(): never {
    throw new TypeError('Compartment requires a resolveHook to import modules.')
}
function createImportMeta(url: string): object {
    return { url }
}
function internalError() {
    throw new TypeError('Compartment encounters an internal error.')
}
