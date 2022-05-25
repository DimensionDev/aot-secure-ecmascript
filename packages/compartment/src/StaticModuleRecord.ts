import type { Compartment } from './compartment.js'

export class StaticModuleRecord {
    /**
     * StaticModuleRecord of a module that can be shared across all Compartments.
     * @example
     * ```js
     * const constants = StaticModuleRecord.of({
     *     value: 1,
     *     abs: Math.abs,
     * })
     * ```
     */
    static of(moduleNamespace: SystemJS.Module): StaticModuleRecord {
        return new StaticModuleRecord(() => {
            return [
                [],
                function (exports) {
                    exports(moduleNamespace)
                    return { setters: [], execute: () => {} }
                },
            ]
        })
    }

    /**
     * A StaticModuleRecord of a module that initialized in each Compartments and export only (no live binding supported).
     * @example
     * ```js
     * StaticModuleRecord.ofPerCompartment((currentCompartment) => {
     *      return {
     *          abs: currentCompartment.globalThis.Math.abs,
     *      }
     * })
     * ```
     */
    static ofPerCompartment(
        init: (currentCompartment: Compartment) => Promise<SystemJS.Module> | SystemJS.Module,
    ): StaticModuleRecord {
        return new StaticModuleRecord((currentCompartment) => {
            const namespace = init(currentCompartment)
            return [
                [],
                function (exports) {
                    if (namespace instanceof Promise) {
                        return {
                            setters: [],
                            async execute() {
                                exports(await namespace)
                            },
                        }
                    }
                    exports(namespace)
                    return { setters: [], execute: () => {} }
                },
            ]
        })
    }

    /**
     * A StaticModuleRecord of a [SystemJS format](https://github.com/systemjs/systemjs/blob/main/docs/system-register.md) module.
     *
     * If you choose to use this to emulate "host" module in a compartment, it's your duty to correctly specify a SystemJS module.
     * For simper use case, you can use `ofNamespace` or `ofNamespacePerCompartment`.
     */
    constructor(init: (currentCompartment: Compartment) => [imports: string[], module: SystemJS.RegisterFunction]) {
        this.#init = init
    }
    #init: (currentCompartment: Compartment) => [imports: string[], module: SystemJS.RegisterFunction]
    get init() {
        return this.#init
    }
}
Object.freeze(StaticModuleRecord)
Object.freeze(StaticModuleRecord.prototype)

/** Please read <https://github.com/systemjs/systemjs/blob/main/docs/system-register.md> */

export namespace SystemJS {
    export type Module = Record<string, unknown>
    export type RegisterFunction = (_export: ExportFunction, _context: Context) => RegisterResult
    export interface RegisterResult {
        setters: SetterFunction[]
        execute(): void | Promise<void>
    }
    export type SetterFunction = (module: Module) => void
    export type ExportFunction = {
        <T>(name: string, value: T): T
        <T extends Module>(object: T): T
    }
    export interface Context {
        meta: object
        import(id: string): Promise<Module>
    }
}
