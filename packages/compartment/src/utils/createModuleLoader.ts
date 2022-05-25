import { getInternalSlots } from '../compartment.js'
import { StaticModuleRecord } from '../StaticModuleRecord.js'
import { opaqueProxy } from './opaqueProxy.js'
import type { SystemJS } from './system.js'

/**
 * This kind of Static Module Record is used for source compiled by the compiler.
 */
export type StaticModuleRecordPrecompiled = (this: {
    opaqueProxy: object
    globalLexicals: object
    globalThis: object
}) => (this: { register(imports: string[], register: SystemJS.DeclareFunction): void }) => void

export function createModuleLoader() {
    const modules = new Map<string, StaticModuleRecord>()

    function registerPrecompiledModules(moduleName: string, executor: StaticModuleRecordPrecompiled): void {
        modules.set(
            moduleName,
            new StaticModuleRecord((compartment) => {
                const { globalLexicals, globalThis } = getInternalSlots(compartment)
                let imports: string[]
                let register: SystemJS.DeclareFunction
                executor
                    .call({
                        opaqueProxy,
                        globalLexicals,
                        globalThis,
                    })
                    .call({
                        register(a, b) {
                            imports = a
                            register = b
                        },
                    })

                if (!imports! || !register!) throw new TypeError('[StaticModuleRecord] Invalid precompiled module')
                return [imports, register]
            }),
        )
    }
    return { registerPrecompiledModules, modules }
}
