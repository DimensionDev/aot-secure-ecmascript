import type { Binding } from './index.js'
import { internalError } from './utils/assert.js'

export class StaticModuleRecord {
    #bindings: Binding[]
    constructor(_source: string) {
        throw internalError()
    }
    get bindings() {
        return this.#bindings
    }
}
