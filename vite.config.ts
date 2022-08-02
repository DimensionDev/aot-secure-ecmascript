import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/compartment/test-dist/**/*.js'],
        setupFiles: ['./packages/compartment/test-dist/utils/setup.js'],
        exclude: ['./packages/compartment/test-dist/utils/**/*.js'],
    },
})
