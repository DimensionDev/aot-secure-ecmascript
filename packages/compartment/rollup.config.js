import { defineConfig } from 'rollup'
import { defineRollupSwcOption } from 'rollup-plugin-swc3'
import { swc } from 'rollup-plugin-swc3'

export default defineConfig({
    input: './src/index.ts',
    output: {
        file: './dist/bundle.js',
        format: 'esm',
        sourcemapFile: './dist/bundle.js.map',
    },
    plugins: [
        swc(
            defineRollupSwcOption({
                jsc: { target: 'es2022' },
            }),
        ),
    ],
})
