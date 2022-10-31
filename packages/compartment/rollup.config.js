import { defineConfig } from 'rollup'
import { defineRollupSwcOption } from 'rollup-plugin-swc3'
import { swc } from 'rollup-plugin-swc3'

export default defineConfig({
    input: './src/index.ts',
    output: {
        file: './dist/bundle.js',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [
        swc(
            defineRollupSwcOption({
                sourceMaps: true,
                jsc: { target: 'es2022' },
            }),
        ),
    ],
})
