# Ahead-of-time Secure EcmaScript

The monorepo contains a set of packages that helps adopt [SES](https://github.com/tc39/proposal-ses) in a pre-compiled
way.

## Security Assumptions

This project has the following security assumptions (based on our usage):

1.  Environment is already `lockdown()` by [ses](https://github.com/endojs/endo/tree/master/packages/ses).
2.  Dynamic code execution (`eval` and `Function`) is not possible (if it is possible, please use the Compartment
    provided by [ses](https://github.com/endojs/endo/tree/master/packages/ses)).
3.  Files executed are either precompiled into [ThirdPartyStaticModuleRecord][1] or trusted.

## Roadmap

-   ✅ `@masknet/static-module-record-swc`: A [swc][2] plugin to transform ES Module into [ThirdPartyStaticModuleRecord][1].
-   ⌛ `@masknet/compartment`: An eval-less implementation of [Compartment][1].
-   ⌛`@masknet/web-endowments`: Provide common Web APIs, with `AbortSignal` support to cancel out all side
    effects within a compartment, and provide attenuations (e.g. limits accessible databases of `indexedDB`, or limit
    accessible domains in `fetch`).
-   ❓`@masknet/membrane`: A membrane library.
-   ❓`@masknet/intrinsic-snapshot`: Make a snapshot of all intrinsic (including host APIs).

[1]: https://github.com/tc39/proposal-compartments/pull/46/files
[2]: https://github.com/swc-project/swc
