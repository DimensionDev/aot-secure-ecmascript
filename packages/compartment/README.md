# @masknet/compartment

An eval-free implementation of [Compartment](https://github.com/tc39/proposal-compartments/pull/46/files).

This package should be run in the environment described below:

-   Satisfy the [security assumption](../../README.md#security-assumptions).
-   ES2021 syntax available.

## APIs

## Limitations

-   `Compartment.prototype.evaluate()`, `StaticModuleRecord` constructor is not supported.
-   `Compartment` does not support inherits the root compartment because it does not created by this polyfill.
