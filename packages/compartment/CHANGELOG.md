# @masknet/compartment

## 0.3.8

### Patch Changes

-   d708b09: fix: live export does not setup correctly

## 0.3.7

### Patch Changes

-   91a63b6: fix: alias import and default import not working

## 0.3.6

### Patch Changes

-   6ecb93a: fix: hangs when a module import itself

## 0.3.5

### Patch Changes

-   6de38a5: add bundle

## 0.3.4

### Patch Changes

-   8ce3aff: fix: namespace object does not reflect to live export

## 0.3.3

### Patch Changes

-   72460dc: fix env object will cause chrome devtools crash

## 0.3.2

### Patch Changes

-   be8c572: add types field

## 0.3.1

### Patch Changes

-   9429d89: add default prototype of makeGlobalThis

## 0.3.0

### Minor Changes

-   8cdc134: update api signature of Module
-   99f8965: remove Compartment, createModuleCache, createWebImportMeta, URLResolveHook

## 0.2.3

### Patch Changes

-   762d129: add generic to Module and ModuleSource
-   00f2da8: fix: module env record throws on the setter
-   7da5cdb: move globalThis out of environment record
-   762d129: add Symbol.toString tag to Module and ModuleSource

## 0.2.2

### Patch Changes

-   1ba4f60: remove unsupported syntax in safari 14
-   02eed40: rename SyntheticModuleRecord to VirtualModuleRecord
-   f4913e0: fix env object cannot be set
-   1dcaf05: remove StaticModuleRecord constructor
-   393fe2a: add source property to reflect the module source
-   c3cc4cc: fix dynamic import the same record multiple times
-   8eb9860: rename initialize in virtual module record to execute
-   d9e88f8: change shape of Module constructor

## 0.2.1

### Patch Changes

-   c44b77b: Implement new Evaluators API
-   212a2be: Allow initialize function to be undefined
-   3783fc3: Rename ExecutionContext to Evaluators
-   0580f03: Set this when calling initialize of virtual module

## 0.2.0

### Minor Changes

-   1d5a849: Add ModuleSource constructor
-   9bda3a7: Implement new virtual module binding format
-   f152912: Deprecate Compartment constructor before rewrite
-   6398846: Add ExecutionContext constructor
-   a606687: Implement live binding

### Patch Changes

-   9ab17fd: Add Module to ExecutionContext
-   dafaa0e: Fix export \* as name from 'mod' not handled
-   b836c8a: Add ModuleSource to ExecutionContext
-   f152912: Add options bag to ExecutionContext
-   fddd147: Add 3rd parameter to helper function createModuleCache to add extra binding for reexports

## 0.1.1

### Patch Changes

-   557e321: [Spec] Rename ThirdPartyStaticModuleRecord to SyntheticModuleRecord

## 0.1.0

### Minor Changes

-   4139fc5: First release 🎉
