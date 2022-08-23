import { createMembraneMarshall } from '@locker/near-membrane-base'
import { writeFile } from 'node:fs/promises'
import { transform } from '@swc/core'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const { code } = await transform(
    'export default ' + createMembraneMarshall.toString().replace(`localEval(sourceText)`, `sourceText()`),
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
${code}`,
)
