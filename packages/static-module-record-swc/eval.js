import { transformSync } from '@swc/core'
import { fileURLToPath } from 'node:url'

/**
 * @param {string} sourceText
 * @param {string | boolean} sourceMap
 */
export function transform(sourceText, sourceMap = false) {
    if (typeof sourceText !== 'string') throw new TypeError()
    const result = transformSync(sourceText, {
        isModule: true,
        sourceMaps: sourceMap ? 'inline': false,
        inlineSourcesContent: true,
        filename: typeof sourceMap === 'string' ? sourceMap : 'virtual-module.js',
        jsc: {
            target: 'es2022',
            experimental: {
                plugins: [
                    [
                        fileURLToPath(
                            new URL(
                                './target/wasm32-unknown-unknown/release/swc_transformer_static_module_record.wasm',
                                import.meta.url,
                            ),
                        ),
                        {
                            template: {
                                type: 'eval',
                            },
                        },
                    ],
                ],
            },
        },
    })
    return result.code
}

export class ModuleSource {
    /**
     * @param {string} sourceText
     */
    constructor(sourceText) {
        if (typeof sourceText !== 'string') throw new TypeError()
        const compiled = transform(sourceText)
        if (availablePolicy) return (0, eval)(availablePolicy.createScript(compiled))
        return (0, eval)(compiled)
    }
}

export class ModuleSourceWithSourceMap {
    /**
     * @param {string} sourceText
     */
    constructor(sourceText) {
        if (typeof sourceText !== 'string') throw new TypeError()
        const compiled = transform(sourceText, true)
        if (availablePolicy) return (0, eval)(availablePolicy.createScript(compiled))
        return (0, eval)(compiled)
    }
}

let availablePolicy = undefined
/**
 * @param {TrustedTypePolicy} policy
 */
export function setupTrustedTypes(policy = defaultTrustedTypes()) {
    availablePolicy = policy
}

/**
 * @returns {TrustedTypePolicy}
 */
function defaultTrustedTypes() {
    if (typeof trustedTypes !== 'object') return
    return trustedTypes.createPolicy('virtual-module-source', {
        createScript(module) {
            return module
        },
    })
}
