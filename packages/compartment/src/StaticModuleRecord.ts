import { internalError } from './utils/opaqueProxy.js'

export class StaticModuleRecord {
    #nominal: any
    constructor(_source: string) {
        throw internalError()
    }
}
