import { ModuleSource } from '../dist/index.js'
import { expect, it } from 'vitest'

it('throws', () => {
    expect(() => new ModuleSource("")).toThrow(EvalError)
    expect(() => ModuleSource.prototype.bindings).toThrow(TypeError)
})
