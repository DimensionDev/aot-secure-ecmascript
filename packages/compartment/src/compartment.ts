import { makeGlobalThis } from './makeGlobalThis.js'

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
            }
        }
    }
    #globalThis: typeof globalThis
    #globalLexicals: object = Object.create(null)
    #name: string | undefined
    constructor(
        endowments?: Record<PropertyKey, unknown>,
        _modules?: undefined | null | Record<string, unknown>,
        _options?: CompartmentOptions,
    ) {
        if (typeof _options === 'object') {
            const { name, transforms } = _options
            if (transforms) throw new TypeError('Compartment: transforms is not supported')

            this.#name = String(name)
        }

        this.#globalThis = makeGlobalThis(Object.prototype, endowments)
    }
    // Should be rejected by CSP.
    evaluate(source: string) {
        return this.#globalThis.eval(source)
    }
    get globalThis(): typeof globalThis {
        return this.#globalThis
    }
    async import(moduleSpecifier: string): Promise<unknown> {
        throw new TypeError('To be implemented')
    }
    // importNow(moduleSpecifier: string): unknown {
    //     throw new TypeError('To be implemented')
    // }
    // async load(moduleSpecifier: string): Promise<unknown> {
    //     throw new TypeError('To be implemented')
    // }
    // module(moduleSpecifier: string): ModuleLink {}
    get name() {
        return this.#name ?? '<unknown>'
    }
}
export interface CompartmentOptions {
    name?: string
    resolveHook?(moduleSpecifier: string, moduleReferrer: string): string
    importHook?(moduleSpecifier: string): Promise<ModuleLink>
    // moduleMapHook?(moduleSpecifier: string): ModuleLink
    // Not supported since no runtime evaluator is available
    transforms?: never
    // globalLexicals?: object
}

export type ModuleLink = any
