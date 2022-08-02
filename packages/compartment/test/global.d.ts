interface Module<T extends object = any> {
    get source(): ModuleSource | null;
}
interface ModuleConstructor {
    // TODO: virtual module record
    new <T extends object = any>(source: ModuleSource<T>): Module<T>;
}
declare var Module: ModuleConstructor;

interface ModuleSource<T extends object = any> {
    // TODO: bindings properties
}
interface ModuleSourceConstructor {
    new (sourceText: string): ModuleSource;
}
declare var ModuleSource: ModuleSourceConstructor;
