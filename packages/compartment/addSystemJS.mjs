import { writeFile } from 'fs/promises'
const url = 'https://fastly.jsdelivr.net/npm/systemjs@latest/dist/s.js'

const source = (await (await fetch(url)).text())
    // modifications
    .replace(`var envGlobal = hasSelf ? self : global;`, ``)
    .replace(`var hasSelf = typeof self !== 'undefined';`, `var hasSelf = false;`)
    .replace(`var hasDocument = typeof document !== 'undefined';`, `var hasDocument = false;`)
    .replace(`typeof location !== 'undefined'`, `false`)
    .replace(`typeof fetch !== 'undefined'`, `false`)
    .replace(`typeof importScripts === 'function'`, `false`)
    .replace(`function SystemJS ()`, `SystemJS = function SystemJS ()`)
    .replace(`envGlobal.System = new SystemJS();`, ``)
    .replace(`function resolveIfNotPlainOrUrl`, `resolveIfNotPlainOrUrl = function `)

const text = `/**
 * All rights belong to https://github.com/systemjs/systemjs project.
 * This is a modified version of the original file.
 *
 * Run addSystemJS.mjs to follow the upstream.
 */
export let SystemJS, resolveIfNotPlainOrUrl;
${source}`
writeFile(new URL('./src/utils/system.js', import.meta.url), text)
