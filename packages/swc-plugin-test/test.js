import { transformFile } from '@swc/core'
import { fileURLToPath } from 'url'

const out = fileURLToPath(new URL('./nest/input.js', import.meta.url))
const cwd = fileURLToPath(new URL('./', import.meta.url))
console.log('cwd = ', cwd)

const { code } = await transformFile(out, {
    jsc: {
        target: 'es2022',
        experimental: {
            plugins: [
                [
                    '@masknet/static-module-record-swc',
                    {
                        template: {
                            type: 'callback-infer',
                            callback: '__register_module__',
                            cwd,
                        },
                    },
                ],
            ],
        },
    },
})
console.log(code)
