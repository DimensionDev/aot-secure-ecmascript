# webpack-reflect-module-plugin

This plugin adds experimental support for the [Import Reflection proposal](https://github.com/tc39/proposal-import-reflection).

## Limitation

### Static reflection syntax

This plugin cannot extend the JavaScript parser, therefore we cannot support the following syntax added in the proposal:

```js
// Proposal:
import module x from './file.js'
```

Instead, we use [Import Assertion](https://v8.dev/features/import-assertions) syntax as a temporarily replacement for the new syntax.

```js
// This plugin
import x from './file.js' assert { reflect: 'module' }
```

### Transitive dependencies

The transitive dependencies will be bundled as a reflected module too, this allows a userland VirtualModuleSource runtime to dynamic import an unknown reflected module.

> a

```js
import x from 'b'
```

> b

```js
export default function hello() {}
```

> src/index.js

```js
import a from 'a' assert { reflect: 'module' }
assert(a.bindings[0].from === 'b')

// The expression is dynamic, but can be supported because it is a transitive dependency of a.
import(a.bindings[0].from, { reflect: 'module' })

// Runtime error: "b/lib.js" is not in the pre-reflected module list.
// This should success if it runs in a real runtime that supports native Import Reflection.
import(a.bindings[0].from + '/lib.js', { reflect: 'module' })
```

### Circular import fails but works in real ES Module

This is a [limitation of Virtual Module Source](https://github.com/tc39/proposal-compartments/issues/70).
This format cannot express hoisted functions correctly.

### CommonJS modules

How this proposal interact with CommonJS module is unknown, and things get complex when it across the ESM-CommonJS boundary, but we will try to support it.
