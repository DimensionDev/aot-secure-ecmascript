import { makeGlobalThis } from './makeGlobalThis.js'

export class Compartment {
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
    #globalThis: typeof globalThis
    get globalThis(): typeof globalThis {
        return this.#globalThis
    }
    // async import(): Promise<unknown> {
    //     throw new TypeError('To be implemented')
    // }
    // importNow(): unknown {
    //     throw new TypeError('To be implemented')
    // }
    // async load(): Promise<unknown> {
    //     throw new TypeError('To be implemented')
    // }
    // module(): ModuleLink {}
    #name: string | undefined
    get name() {
        return this.#name ?? '<unknown>'
    }
}
export interface CompartmentOptions {
    name?: string
    // resolveHook?(moduleSpecifier: string, moduleReferrer: string): string
    // importHook?(moduleSpecifier: string): Promise<ModuleLink>
    // moduleMapHook?(moduleSpecifier: string): ModuleLink
    // Not supported since no runtime evaluator is available
    transforms?: never
    // globalLexicals?: object
}

// export type ModuleLink = any
