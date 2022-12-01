import { expect, it } from 'vitest'
import type { RequireHook } from '../../src/commonjs/runtime.js'
import { CommonJSModule, commonjsRequires, imports } from '../../src/index.js'
import { convertCommonJS } from '../../../static-module-record-swc/commonjs.mjs'

const src = new ModuleSource(
    convertCommonJS(`
    const React = require('react')
    module.exports.Component = function Component() {}
    module.exports.use = React.use`),
)
const react = new ModuleSource(convertCommonJS(`module.exports = require('./dist/react-development.js')`, ['use']))
const react2 = new ModuleSource(convertCommonJS(`module.exports.use = function use() {}`))

it('can use as a normal CommonJS runtime', async () => {
    const map: Record<string, CommonJSModule> = {}
    const requireHook: RequireHook = (path) => map[path] ?? null
    map['react'] = new CommonJSModule('react', react, { globalThis, requireHook })
    map['src'] = new CommonJSModule('./src/index.js', src, { globalThis, requireHook })
    map['./dist/react-development.js'] = new CommonJSModule('react/dev', react2, { globalThis, requireHook })

    const srcInstance = commonjsRequires(map['src'])
    const reactInstance = commonjsRequires(map['./dist/react-development.js'])
    expect(srcInstance.Component).toBeTypeOf('function')
    expect(srcInstance.use).toBe(reactInstance.use)

    // import as ES module
    const ns = await imports(map['src'].asESModule)
    const ns2 = await imports(map['react'].asESModule)
    expect(ns.default.Component).toBe(srcInstance.Component)

    const f = () => {}
    reactInstance.use = f
    const f2 = () => {}
    reactInstance.use = f2
    expect(ns2.use).toBe(f2)
})
