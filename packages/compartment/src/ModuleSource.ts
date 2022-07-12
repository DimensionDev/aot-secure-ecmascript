import type { Binding } from "./types.js"

export class ModuleSource {
    #code: unknown
    bindings: Binding[] = []
    constructor(source: string) {
        throw new EvalError(
            `Refused to evaluate a string as JavaScript.`,
        )
    }
}
