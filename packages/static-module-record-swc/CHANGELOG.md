# @masknet/static-module-record-swc

## 0.6.1

### Patch Changes

- 75909b2: update swc

## 0.6.0

### Minor Changes

- 6dd3bed: update dependencies

## 0.5.0

### Minor Changes

- da873b1: add commonjs support

### Patch Changes

- be3ac75: upgrade to swc latest
- 63dfba3: upgrade dependencies

## 0.4.1

### Patch Changes

- 04e8825: update swc

## 0.4.0

### Minor Changes

- d52bc2e: add new transform options: eval

### Patch Changes

- d52bc2e: upgrade deps

## 0.3.5

### Patch Changes

- 48e5022: update dependencies
- 54dd8c4: follow swc version

## 0.3.4

### Patch Changes

- 3e77997: follow swc abi change

## 0.3.3

### Patch Changes

- 6339ec3: update dependencies

## 0.3.2

### Patch Changes

- 7da5cdb: move globalThis out of environment record

## 0.3.1

### Patch Changes

- 4f10e99: fix assignment pattern not handled
- 4f10e99: fix import-then-export not recognized
- 4f10e99: remove unnecessary (0, \_.access) wrapper
- 8eb9860: rename initialize in virtual module record to execute
- 8bd2ec5: "this" of an imported value should be undefined.

## 0.3.0

### Minor Changes

- c0b8659: Implement new binding format in virtual module

### Patch Changes

- 1657c4f: Add isAsync hint

## 0.2.2

### Patch Changes

- 6791968: Fix object literal shorthand property not handled
- a05de8c: Remove unused tracing statements
- e0c998f: Fix arguments always transformed as unresolved

## 0.2.1

### Patch Changes

- d1f8d16: Add a workaround for imports without binding cannot be imported after converted into ThirdPartyStaticModuleRecord

## 0.2.0

### Minor Changes

- 0398516: [Spec] Merge the initialize 2nd and 3rd parameter into a context object

## 0.1.0

### Major Changes

- 9f33549: First release 🎉
