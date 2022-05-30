import type {
    Binding,
    ThirdPartyStaticModuleRecord,
    StaticModuleRecordInstance,
    StaticModuleRecordPrecompiled,
    StaticModuleRecordPrecompiledInitialize,
} from './types.js'
import { normalizeBindings } from './utils/normalize.js'

/** @internal */
export const StaticModuleRecordPrecompiledSymbol = Symbol()

/** @internal */
export let internalSlot_StaticModuleRecord_get: (mod: StaticModuleRecord) => {
    needImportMeta: boolean
    bindings: readonly Binding[]
    initialize: ThirdPartyStaticModuleRecord['initialize']
    initializeInternal: undefined | StaticModuleRecordPrecompiledInitialize
}

/** @internal */
export let brandCheck_StaticModuleRecord: (mod: unknown) => mod is StaticModuleRecord

export class StaticModuleRecord implements StaticModuleRecordInstance {
    get bindings() {
        return this.#bindings
    }
    constructor(source: string | { source: string } | ThirdPartyStaticModuleRecord)
    /** @internal */
    constructor(source: string | { source: string } | ThirdPartyStaticModuleRecord | StaticModuleRecordPrecompiled)
    constructor(source: string | { source: string } | StaticModuleRecordPrecompiled) {
        if (typeof source === 'string' || 'source' in source) {
            throw new TypeError('Cannot create StaticModuleRecord from source code due to CSP limitations.')
        }

        const { initialize, needsImportMeta, bindings } = source
        const internal = source[StaticModuleRecordPrecompiledSymbol]
        if (typeof initialize !== 'function') {
            throw new TypeError('A ThirdPartyStaticModuleRecord must have an initialize function.')
        }
        this.#needImportMeta = Boolean(needsImportMeta)
        this.#bindings = normalizeBindings(bindings)
        this.#initialize = initialize
        if (internal) this.#initializeInternal = internal
    }
    static {
        internalSlot_StaticModuleRecord_get = (mod: StaticModuleRecord) => ({
            bindings: mod.#bindings,
            initialize: mod.#initialize,
            needImportMeta: mod.#needImportMeta,
            initializeInternal: mod.#initializeInternal,
        })
        brandCheck_StaticModuleRecord = (mod: any): mod is StaticModuleRecord => #needImportMeta in mod
    }
    #needImportMeta = false
    #bindings: readonly Binding[] = []
    #initialize: ThirdPartyStaticModuleRecord['initialize']
    #initializeInternal: StaticModuleRecordPrecompiledInitialize | undefined
}
