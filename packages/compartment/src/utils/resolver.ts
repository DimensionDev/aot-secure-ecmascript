export function simpleResolveHook(url: string, parentUrl: string) {
    if (url.startsWith('.')) return new URL(url, parentUrl).toString()
    return url
}
declare class URL {
    constructor(url: string, parentUrl: string)
}
