# @masknet/static-module-record-swc

> WARNING: This package currently does not follow the [Semantic Versioning](https://semver.org/) because the original standard is still developing. Minor version might include breaking changes!

A @swc/core plugin to convert an ES Module into a [VirtualModuleSource](https://github.com/tc39/proposal-compartments/blob/master/2-virtual-module-source.md).

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

```json
[
    "@masknet/static-module-record-swc",
    {
        "template": {
            "type": "export-default"
        }
    }
]
```

It will convert code

```js
import { writeFile } from 'node:fs/promises'

export const url = new URL('./here.txt', import.meta.url)
await writeFile(url, 'Hello World')
```

into [this file](./tests/snapshot/example.js)

#### `config.template.type: "callback"`

```json
[
    "@masknet/static-module-record-swc",
    { "template": { "type": "callback", "callback": "__register", "firstArg": "/index.js" } }
]
```

It will convert code

```js
import { writeFile } from 'node:fs/promises'

export const url = new URL('./here.txt', import.meta.url)
await writeFile(url, 'Hello World')
```

into [this file](./tests/snapshot/example-callback.js)

#### `config.template.type: "callback-cwd"`

It is similar to `callback` but it will try to infer the file name to URI as the first argument of the callback.

Let's take `/home/jack/aot-ses/packages/static-module-record-swc/tests/fixtures/example-callback-infer.js` as an example.

```json
[
    "@masknet/static-module-record-swc",
    {
        "template": {
            "type": "callback-cwd",
            "callback": "__register",
            "cwd": "/home/jack/aot-ses/packages/static-module-record-swc/"
        }
    }
]
```

Warning: due to the limitation of the swc plugin system, we need a `cwd` to resolve the file name into URI. This `cwd` must contain all input files, otherwise, it will panic.

```js
import { writeFile } from 'node:fs/promises'

export const url = new URL('./here.txt', import.meta.url)
await writeFile(url, 'Hello World')
```

into [this file](./tests/snapshot/example-callback-infer.js)
