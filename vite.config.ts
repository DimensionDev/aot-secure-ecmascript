import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/compartment/test/**/*.ts'],
    },
})
