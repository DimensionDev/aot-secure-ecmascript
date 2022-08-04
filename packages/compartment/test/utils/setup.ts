import { transformSync } from '@swc/core'
import { fileURLToPath } from 'url'
import { it } from 'vitest'

it('install ModuleSource polyfill', () => {})
Reflect.set(globalThis, 'ModuleSource', function ModuleSource(sourceText: string) {
    const result = transformSync(sourceText, {
        isModule: true,
        jsc: {
            target: "es2022",
            experimental: {
                plugins: [
                    [
                        fileURLToPath(
                            new URL(
                                '../../../static-module-record-swc/target/wasm32-unknown-unknown/release/swc_transformer_static_module_record.wasm',
                                import.meta.url,
                            ),
                        ),
                        {},
                    ],
                ],
            },
        },
    })
    const code = result.code.replace(/^export default/, '')
    const transformed = `"use strict"; { let _ = ${code} _ }`
    return eval(transformed)
})
