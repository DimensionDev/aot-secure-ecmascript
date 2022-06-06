# @masknet/static-module-record-swc

A @swc/core plugin to convert an ES Module into a [StaticModuleRecord](https://github.com/tc39/proposal-compartments/blob/775024d93830ee6464363b4b373d9353425a0776/README.md#sketch).

## Usage

Add it in @swc/core config

```js
const config = {
    jsc: {
        experimental: {
            plugins: [
                [
                    '@masknet/static-module-record-swc',
                    // see "config" section below
                    {},
                ],
            ],
        },
    },
}
```

## Configs

### `config.template`

Specify the emit template

#### `config.template.type: "export-default"`

This is the default option.

```js
;[
    '@masknet/static-module-record-swc',
    {
        template: {
            type: 'export-default',
        },
    },
]
```

It will convert code

```js
import { writeFile } from 'node:fs/promises'

export const url = new URL('./here.txt', import.meta.url)
await writeFile(url, 'Hello World')
```

into

```js
export default {
    bindings: [
        {
            import: 'writeFile',
            from: 'node:fs/promises',
        },
        {
            export: 'url',
        },
    ],
    needsImportMeta: true,
    initialize: async function (_, import_meta) {
        const url = new _.URL('./here.txt', import_meta.url)
        _.url = url
        await _.writeFile(url, 'Hello World')
    },
}
```

#### `config.template.type: "callback"`

```js
;[
    '@masknet/static-module-record-swc',
    { template: { type: 'callback', callback: '__register', firstArg: '/index.js' } },
]
```

It will convert code

```js
import { writeFile } from 'node:fs/promises'

export const url = new URL('./here.txt', import.meta.url)
await writeFile(url, 'Hello World')
```

into

```js
'use strict'
__register('/index.js', {
    bindings: [
        {
            import: 'writeFile',
            from: 'node:fs/promises',
        },
        {
            export: 'url',
        },
    ],
    needsImportMeta: true,
    initialize: async function (_, import_meta) {
        const url = new _.URL('./here.txt', import_meta.url)
        _.url = url
        await _.writeFile(url, 'Hello World')
    },
})
```

#### `config.template.type: "callback-cwd"`

It is similar to `callback` but it will try to infer the file name to URI as the first argument of the callback.

Let's take `/home/jack/aot-ses/packages/static-module-record-swc/tests/fixtures/example-callback-infer.js` as an example.

```js
;[
    '@masknet/static-module-record-swc',
    {
        template: {
            type: 'callback-cwd',
            callback: '__register',
            cwd: '/home/jack/aot-ses/packages/static-module-record-swc/',
        },
    },
]
```

Warning: due to the limitation of the swc plugin system, we need a `cwd` to resolve the file name into URI. This `cwd` must contain all input files, otherwise, it will panic.

```js
import { writeFile } from 'node:fs/promises'

export const url = new URL('./here.txt', import.meta.url)
await writeFile(url, 'Hello World')
```

into

```js
'use strict'
__register('/tests/fixture/example-callback-infer.js', {
    bindings: [
        {
            import: 'writeFile',
            from: 'node:fs/promises',
        },
        {
            export: 'url',
        },
    ],
    needsImportMeta: true,
    initialize: async function (_, import_meta) {
        const url = new _.URL('./here.txt', import_meta.url)
        _.url = url
        await _.writeFile(url, 'Hello World')
    },
})
```
