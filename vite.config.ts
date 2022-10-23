import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/compartment/test/**/*.ts'],
        setupFiles: ['./packages/compartment/test/utils/setup.ts'],
        exclude: ['./packages/compartment/test/utils/**/*.ts'],
    },
})
