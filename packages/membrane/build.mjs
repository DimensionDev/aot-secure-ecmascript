import { createMembraneMarshall } from '@locker/near-membrane-base'
import { writeFile } from 'node:fs/promises'
import { transform } from '@swc/core'
import { createRequire } from 'node:module'
import { format } from 'prettier'

const require = createRequire(import.meta.url)

const { code } = await transform(
    `import { debugTargetBookkeeping, attachDebuggerTarget, proxyTargetToLazyPropertyDescriptorStateMap } from ''
export default ${createMembraneMarshall
        .toString()
        .replace(`localEval(sourceText)`, `sourceText()`)
        .replace(/return pointer/, `debugTargetBookkeeping?.(pointer, originalTarget); return pointer`)
        .replace(
            `this.foreignTargetPointer = foreignTargetPointer`,
            `attachDebuggerTarget?.(proxy, foreignTargetPointer); this.foreignTargetPointer = foreignTargetPointer`,
        )}
`,
    {
        jsc: {
            target: 'es2022',
            experimental: {
                plugins: [
                    [
                        require.resolve(
                            '../static-module-record-swc/target/wasm32-unknown-unknown/release/swc_transformer_static_module_record.wasm',
                        ),
                        {},
                    ],
                ],
            },
        },
    },
)
await writeFile(
    new URL('./src/createMembraneMarshall.ts', import.meta.url),
    `// @ts-nocheck
// This file is built from '@locker/near-membrane-base'.createMembraneMarshall.
// DO NOT edit it manually.
` +
        (await format(code.replaceAll('_.undefined', 'undefined'), {
            trailingComma: 'all',
            printWidth: 120,
            semi: false,
            singleQuote: true,
            bracketSameLine: true,
            tabWidth: 4,
            parser: 'babel',
        })),
)
