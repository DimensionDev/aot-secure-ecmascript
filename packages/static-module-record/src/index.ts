import * as swc from '@swc/core'
import { fileURLToPath } from 'url'

export function transform(filePath: string, fileContent: string) {
    swc.transform(fileContent, {
        filename: filePath,
        sourceMaps: true,
        module: {
            type: 'es6',
        },
        jsc: {
            target: 'es2020',
            parser: {
                syntax: 'ecmascript',
            },
            transform: {},
            experimental: {
                plugins: [
                    [
                        fileURLToPath(
                            new URL(
                                '../../static-module-record-swc/target/wasm32-unknown-unknown/release/swc_transformer_static_module_record.wasm',
                                import.meta.url,
                            ),
                        ),
                        { globalStaticModuleRecord: true, template: { type: 'ExportDefault' } },
                    ],
                ],
            },
        },
    }).then((output) => {
        console.log(output.code)
    })
}

transform('hello.js', `export default class {}`)
