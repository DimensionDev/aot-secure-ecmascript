import type { Binding } from './types.js'

export class ModuleSource<T extends object = any> {
    #code: unknown
    get bindings(): Binding[] {
        this.#code
        return []
    }
    constructor(source: string) {
        throw new EvalError(`Refused to evaluate a string as JavaScript.`)
    }
}
// TODO: add /*#__PURE__*/ to it.
Reflect.defineProperty(ModuleSource.prototype, Symbol.toStringTag, {
    configurable: true,
    value: 'ModuleSource',
})
