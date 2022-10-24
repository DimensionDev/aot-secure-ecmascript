import { ModuleSource } from '../src/index.js'
import { expect, it } from 'vitest'

it('throws', () => {
    expect(() => new ModuleSource('')).toThrow(EvalError)
    expect(() => ModuleSource.prototype.bindings).toThrow(TypeError)
})
