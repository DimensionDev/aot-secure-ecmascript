# Ahead-of-time Secure EcmaScript

The monorepo contains a set of packages that helps adopt [SES](https://github.com/tc39/proposal-ses) in a pre-compiled
way.

## Security Assumptions

This project has the following security assumptions (based on our usage):

1.  Environment is already `lockdown()` by [ses](https://github.com/endojs/endo/tree/master/packages/ses).
2.  Dynamic code execution (`eval` and `Function`) is not possible (if it is possible, please use the Compartment
    provided. by [ses](https://github.com/endojs/endo/tree/master/packages/ses)).
3.  Files executed are either precompiled by this package or trusted.

## Roadmap

-   `@masknet/static-module-record`: Precompile files from ES Modules into `SystemJS` and wrap with necessary code that
    required to be run in the `@masknet/compartment`.
-   `@masknet/compartment`: A compartment implementation that only accepts output from `@masknet/static-module-record`
-   `@masknet/compartment-web-endowments`: Provide common Web APIs, with `AbortSignal` support to cancel out all side
    effects within a compartment, and provide attenuations (e.g. limits accessible databases of `indexedDB`, or limit
    accessible domains in `fetch`).
-   `@masknet/compartment-membrane`: Maybe a wrapper of `near-membrane`? Also supports `AbortSignal` so we can revoke
    all abilities & connections of a compartment
