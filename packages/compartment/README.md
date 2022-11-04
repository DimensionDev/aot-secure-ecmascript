# @masknet/compartment

> WARNING: This package currently does not follow the [Semantic Versioning](https://semver.org/) because the original standard is still developing. The minor version might include breaking changes!

This package implements a user-land [Virtual Module Source][layer-2] evaluator.

This package currently implements the following specs/API explainers:

-   [ECMA262 Normative PR: Layering: Add HostLoadImportedModule hook](https://github.com/tc39/ecma262/pull/2905/)
-   [Module Block proposal](https://tc39.es/proposal-js-module-blocks/)
-   [Compartment proposal: Layer 0: Module and ModuleSource constructor][layer-0]
-   [Compartment proposal: Layer 1: ModuleSource reflection][layer-1]
-   [Compartment proposal: Layer 2: Virtual Module Source][layer-2]
-   [Compartment proposal: Layer 3: Evaluator][layer-3]

## Assumptions and runtime requirements

1.  The environment is already `lockdown()` by [ses][ses].
2.  Dynamic code execution (`eval` and `Function`) is not possible.
3.  Code executed are either trusted or precompiled into a [Virtual Module Source][layer-2] by a compiler like [@masknet/static-module-record-swc](../static-module-record-swc/).
4.  ECMAScript 2022 syntax is available.

## APIs

### `ModuleSource` constructor

Implements `ModuleSource` from [layer 0][layer-0] and [layer 1][layer-1] of the compartment proposal.

This constructor always throws like it is in an environment that cannot use eval.

```ts
new ModuleSource()
// EvalError: Refused to evaluate a string as JavaScript.
```

### `Module` constructor

Implements `Module` from [layer 0][layer-0] and [layer-2][layer-2] of the compartment proposal.

```ts
import { Module, imports, type VirtualModuleRecord } from '@masknet/compartment'
const virtualModule: VirtualModuleRecord = {
    execute(environment, context) {
        console.log('module constructed!')
    },
}
const module = new Module(virtualModule, import.meta.url, () => null)
//                                       ^referral        ^importHook
const moduleNamespace = await imports(module)
```

### `imports` function

This function is a user-land dynamic import that accepts `Module` instances.

This function does not accept strings as dynamic import does.

### `Evaluators` constructor

This constructor implements `Evaluators` from [layer 3][layer-3] of the compartment proposal.

```ts
import { Evaluators, Module, imports, type VirtualModuleRecord } from '@masknet/compartment'
const globalThis = { answer: 42 }
const evaluators = new Evaluators({ globalThis })
const virtualModule: VirtualModuleRecord = {
    bindings: [{ export: 'x' }],
    execute(environment, { globalThis }) {
        environment.x = globalThis.answer // 42
    },
}
const module = new evaluators.Module(virtualModule, import.meta.url, () => null)
const moduleNamespace = await imports(module)
moduleNamespace.x // 42
```

### `makeGlobalThis` function

This function is a utility function that creates a new object that contains only items from the ECMAScript specification.
Those items are from the **current realm**, therefore sharing them with the Evaluators without [lockdown()](ses) might bring serious problems.

```ts
import { makeGlobalThis } from '@masknet/compartment'
const globalThis = makeGlobalThis()
globalThis.Array // [Function: Array]
```

[ses]: https://github.com/endojs/endo/tree/master/packages/ses
[layer-0]: https://tc39.es/proposal-compartments/0-module-and-module-source.html
[layer-1]: https://github.com/tc39/proposal-compartments/blob/master/1-static-analysis.md
[layer-2]: https://github.com/tc39/proposal-compartments/blob/master/2-virtual-module-source.md
[layer-3]: https://github.com/tc39/proposal-compartments/blob/master/3-evaluator.md
