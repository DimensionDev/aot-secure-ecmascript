import type { ModuleNamespace } from '../types.js'

/**
 * @see https://github.com/systemjs/systemjs/blob/main/docs/system-register.md
 * @internal
 */
export namespace SystemJS {
    export type RegisterArray = readonly [imports: readonly string[], module: SystemJS.DeclareFunction]
    export type DeclareFunction = (_export: ExportFunction, _context: Context) => DeclareResult
    export interface DeclareResult {
        setters: SetterFunction[]
        execute(): void | Promise<void>
    }
    export type SetterFunction = (module: ModuleNamespace) => void
    export type ExportFunction = {
        <T>(name: string, value: T): T
        <T extends ModuleNamespace>(object: T): T
    }
    export interface Context {
        meta: object
        import(id: string): Promise<ModuleNamespace>
    }
}
/**
 * @see https://github.com/systemjs/systemjs/blob/main/docs/system-register.md
 * @internal
 */
export class SystemJS {
    import(id: string, parentURL: string | undefined): Promise<object>
    createContext(parentID: string): object
    register(deps: readonly string[], declare: SystemJS.DeclareFunction): void
    getRegister(): SystemJS.RegisterArray
    prepareImport(doProcessScripts: unknown): Promise<void>
    createScript(url: string): never
    instantiate(url: string, parentUrl: string | undefined): Promise<SystemJS.RegisterArray>
    shouldFetch(): boolean
    fetch?: typeof globalThis.fetch
    resolve(id: string, parentURL: string): string
}
