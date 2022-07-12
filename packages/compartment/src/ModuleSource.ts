import type { Binding } from "./types.js"

export class ModuleSource {
    #field: Binding[]
    constructor(source: string) {
        throw new EvalError(
            `Refused to evaluate a string as JavaScript.`,
        )
    }
    get bindings() {
        return this.#field
    }
}
