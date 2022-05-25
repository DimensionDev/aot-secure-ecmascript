/** Please read <https://github.com/systemjs/systemjs/blob/main/docs/system-register.md> */

export namespace SystemJS {
    export type Module = Record<string, unknown>
    export type DeclareFunction = (_export: ExportFunction, _context: Context) => DeclareResult
    export interface DeclareResult {
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
export class SystemJS {
    import(id: string, parentURL: string): Promise<unknown>
    createContext(parentID: string): object
    register(deps: readonly string[], declare: SystemJS.DeclareFunction): void
    getRegister(): readonly [readonly string[], SystemJS.DeclareFunction]
    prepareImport(doProcessScripts): Promise<void>
    createScript(url: string): never
    instantiate(url, firstParentUrl): Promise<readonly [readonly string[], SystemJS.DeclareFunction]>
    shouldFetch(): boolean
    fetch?: typeof globalThis.fetch
    resolve(id, parentURL): string
}
