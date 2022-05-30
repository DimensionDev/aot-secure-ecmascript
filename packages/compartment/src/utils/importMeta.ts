export function createWebImportMeta(spec: string, meta: object) {
    Reflect.set(meta, 'url', spec)
}
