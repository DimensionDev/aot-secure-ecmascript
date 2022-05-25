import { getInternalSlots } from '../compartment.js'
import { StaticModuleRecord, type SystemJS } from '../StaticModuleRecord.js'
import { opaqueProxy } from './opaqueProxy.js'

/**
 * This kind of Static Module Record is used for source compiled by the compiler.
 */
export type StaticModuleRecordPrecompiled = (this: {
    opaqueProxy: object
    globalLexicals: object
    globalThis: object
}) => (this: { register(imports: string[], register: SystemJS.RegisterFunction): void }) => void

export function createModuleLoader() {
    const modules = new Map<string, StaticModuleRecord>()

    function registerPrecompiledModules(moduleName: string, executor: StaticModuleRecordPrecompiled): void {
        modules.set(
            moduleName,
            new StaticModuleRecord((compartment) => {
                const { globalLexicals, globalThis } = getInternalSlots(compartment)
                let imports: string[]
                let register: SystemJS.RegisterFunction
                executor
                    .call({
                        opaqueProxy,
                        globalLexicals,
                        globalThis,
                    })
                    .call({
                        register(imports, register) {
                            imports = imports
                            register = register
                        },
                    })

                if (!imports! || !register!) throw new TypeError('[StaticModuleRecord] Invalid precompiled module')
                return [imports, register]
            }),
        )
    }
    return { registerPrecompiledModules, modules }
}
