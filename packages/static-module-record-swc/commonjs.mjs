import { init, parse } from 'cjs-module-lexer'
await init()

/**
 * @param {string} code
 * @param {string[]} reexports
 */
export function convertCommonJS(code, reexports) {
    const ident = { count: 0 }
    const next = {
        get ident() {
            return findIdent(code, ident)
        },
    }
    const [lexicals, skipRender] = [next.ident, next.ident]
    const defaultExport = next.ident
    const exports = [...new Set(parse(code).exports.concat(reexports))].map((name) => [name, next.ident])

    let str = ['']
    // var [a, b] = import.meta.commonjs(f, obj)
    str.push(`var [${lexicals}, ${skipRender}] = import.meta.commonjs(`)
    str.push(`x => ${defaultExport} = x, `)
    str.push(`{\n`)
    for (const [name, ident] of exports) {
        str.push(`    [${JSON.stringify(name)}]: x => ${ident} = x,\n`)
    }
    str.push(`});\n`)

    // var a, b, c, d, ...
    str.push(`var ${[defaultExport, ...exports.map((x) => x[1])].join(', ')};\n`)

    // export { a as originalName, b as originalName2, ... }
    str.push(`export { `)
    str.push(`${defaultExport} as default, `)
    for (const [name, ident] of exports) {
        str.push(`${ident} as ${JSON.stringify(name)}, `)
    }
    str.push(`};\n`)

    // commonjs wrapper
    str.push(`;(function ({ exports, require, module, __filename, __dirname }) {\n`)
    str.push(`if (${skipRender}) return;\n`)
    str.push(code)
    str.push(`\n}.call(${lexicals}.exports, ${lexicals}));`)

    return str.join('')
}

/**
 * @param {string} code
 * @param {{count: number}} index
 */
function findIdent(code, index) {
    while (code.includes(`_` + index.count)) index.count++
    return `_` + index.count++
}
