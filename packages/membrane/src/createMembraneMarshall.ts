// @ts-nocheck
// This file is built from '@locker/near-membrane-base'.createMembraneMarshall.
// DO NOT edit it manually.
export default {
    bindings: [
        {
            import: 'debugTargetBookkeeping',
            from: '',
        },
        {
            import: 'attachDebuggerTarget',
            from: '',
        },
        {
            import: 'proxyTargetToLazyPropertyDescriptorStateMap',
            from: '',
        },
        {
            export: 'default',
        },
    ],
    execute: function (__, context) {
        var _ = context.globalThis
        function createMembraneMarshall(globalObject) {
            var _ref, _ref2, _ReflectApply, _globalThisRef$BigInt, _globalThisRef$BigUin
            /* eslint-disable prefer-object-spread */ const ArrayCtor = _.Array
            const ArrayBufferCtor = _.ArrayBuffer
            const ErrorCtor = _.Error
            const NumberCtor = _.Number
            const ObjectCtor = _.Object
            const ProxyCtor = _.Proxy
            const ReflectRef = _.Reflect
            const RegExpCtor = _.RegExp
            const StringCtor = _.String
            const SymbolCtor = _.Symbol
            const TypeErrorCtor = _.TypeError // eslint-disable-next-line @typescript-eslint/no-shadow, no-shadow
            const WeakMapCtor = _.WeakMap
            const WeakSetCtor = _.WeakSet
            const { for: SymbolFor, toStringTag: SymbolToStringTag } = SymbolCtor
            const {
                // eslint-disable-next-line @typescript-eslint/no-shadow, no-shadow
                apply: ReflectApply,
                construct: ReflectConstruct,
                defineProperty: ReflectDefineProperty,
                deleteProperty: ReflectDeleteProperty,
                get: ReflectGet,
                getOwnPropertyDescriptor: ReflectGetOwnPropertyDescriptor,
                getPrototypeOf: ReflectGetPrototypeOf,
                has: ReflectHas,
                isExtensible: ReflectIsExtensible,
                ownKeys: ReflectOwnKeys,
                preventExtensions: ReflectPreventExtensions,
                set: ReflectSet, // eslint-disable-next-line @typescript-eslint/no-shadow, no-shadow
                setPrototypeOf: ReflectSetPrototypeOf,
            } = ReflectRef
            const {
                assign: ObjectAssign,
                defineProperties: ObjectDefineProperties,
                freeze: ObjectFreeze,
                getOwnPropertyDescriptor: ObjectGetOwnPropertyDescriptor,
                getOwnPropertyDescriptors: ObjectGetOwnPropertyDescriptors,
                isFrozen: ObjectIsFrozen,
                isSealed: ObjectIsSealed,
                keys: ObjectKeys,
                prototype: ObjectProto,
                seal: ObjectSeal,
            } = ObjectCtor
            const {
                hasOwnProperty: ObjectProtoHasOwnProperty,
                propertyIsEnumerable: ObjectProtoPropertyIsEnumerable,
                toString: ObjectProtoToString,
            } = ObjectProto
            const { hasOwn: OriginalObjectHasOwn } = ObjectCtor
            const {
                __defineGetter__: ObjectProtoDefineGetter,
                __defineSetter__: ObjectProtoDefineSetter,
                __lookupGetter__: ObjectProtoLookupGetter,
                __lookupSetter__: ObjectProtoLookupSetter,
            } = ObjectProto
            const ObjectHasOwn =
                typeof OriginalObjectHasOwn === 'function'
                    ? OriginalObjectHasOwn
                    : (object, key) => ReflectApply(ObjectProtoHasOwnProperty, object, [key])
            const globalThisRef =
                (_ref =
                    (_ref2 =
                        globalObject != null
                            ? globalObject // https://caniuse.com/mdn-javascript_builtins_globalthisfor
                            : typeof _.globalThis !== 'undefined'
                            ? _.globalThis
                            : undefined) != null
                        ? _ref2 // eslint-disable-next-line no-restricted-globals
                        : typeof _.self !== 'undefined'
                        ? _.self
                        : undefined) != null
                    ? _ref
                    : (ReflectDefineProperty(ObjectProto, 'globalThis', {
                          __proto__: null,
                          configurable: true,
                          get() {
                              ReflectDeleteProperty(ObjectProto, 'globalThis') // Safari 12 on iOS 12.1 has a `this` of `undefined` so we
                              // fallback to `self`.
                              // eslint-disable-next-line no-restricted-globals
                              return this != null ? this : _.self
                          },
                      }),
                      _.globalThis)
            const IS_IN_SHADOW_REALM = typeof globalObject !== 'object' || globalObject === null
            const LOCKER_DEBUG_MODE_SYMBOL = !IS_IN_SHADOW_REALM ? SymbolFor('@@lockerDebugMode') : undefined
            const LOCKER_IDENTIFIER_MARKER = '$LWS'
            const LOCKER_NEAR_MEMBRANE_SERIALIZED_VALUE_SYMBOL = !IS_IN_SHADOW_REALM
                ? SymbolFor('@@lockerNearMembraneSerializedValue')
                : undefined
            const LOCKER_NEAR_MEMBRANE_SYMBOL = !IS_IN_SHADOW_REALM ? SymbolFor('@@lockerNearMembrane') : undefined
            const LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL = SymbolFor('@@lockerNearMembraneUndefinedValue') // The default stack trace limit in Chrome is 10.
            // Set to 20 to account for stack trace filtering.
            const LOCKER_STACK_TRACE_LIMIT = 20 // This package is bundled by third-parties that have their own build time
            // replacement logic. Instead of customizing each build system to be aware
            // of this package we implement a two phase debug mode by performing small
            // runtime checks to determine phase one, our code is unminified, and
            // phase two, the user opted-in to custom devtools formatters. Phase one
            // is used for light weight initialization time debug while phase two is
            // reserved for post initialization runtime.
            const LOCKER_UNMINIFIED_FLAG = `${() => /* $LWS */ 1}`.includes('*') // Indicate whether debug support is available.
            const LOCKER_DEBUGGABLE_FLAG = LOCKER_UNMINIFIED_FLAG && !IS_IN_SHADOW_REALM // BigInt is not supported in Safari 13.1.
            // https://caniuse.com/bigint
            const FLAGS_REG_EXP = IS_IN_SHADOW_REALM ? /\w*$/ : undefined // Minification safe reference to the private `BoundaryProxyHandler`
            // 'serializedValue' property name.
            let MINIFICATION_SAFE_SERIALIZED_VALUE_PROPERTY_NAME // Minification safe references to the private `BoundaryProxyHandler`
            // 'apply' and 'construct' trap variant's property names.
            let MINIFICATION_SAFE_TRAP_PROPERTY_NAMES
            const SUPPORTS_BIG_INT = typeof _.BigInt === 'function'
            const { isArray: isArrayOrThrowForRevoked } = ArrayCtor
            const {
                includes: ArrayProtoIncludes,
                indexOf: ArrayProtoIndexOf,
                slice: ArrayProtoSlice,
            } = ArrayCtor.prototype
            const { isView: ArrayBufferIsView } = ArrayBufferCtor
            const BigIntProtoValueOf = SUPPORTS_BIG_INT ? _.BigInt.prototype.valueOf : undefined
            const { valueOf: BooleanProtoValueOf } = _.Boolean.prototype
            const { toString: ErrorProtoToString } = ErrorCtor.prototype
            const { bind: FunctionProtoBind, toString: FunctionProtoToString } = _.Function.prototype
            const { stringify: JSONStringify } = _.JSON
            const { isInteger: NumberIsInteger } = NumberCtor
            const { valueOf: NumberProtoValueOf } = NumberCtor.prototype
            const { revocable: ProxyRevocable } = ProxyCtor
            const { prototype: RegExpProto } = RegExpCtor
            const { exec: RegExpProtoExec, test: RegExpProtoTest, toString: RegExProtoToString } = RegExpProto // Edge 15 does not support RegExp.prototype.flags.
            // https://caniuse.com/mdn-javascript_builtins_regexp_flags
            const RegExpProtoFlagsGetter = IS_IN_SHADOW_REALM
                ? (_ReflectApply = ReflectApply(ObjectProtoLookupGetter, RegExpProto, ['flags'])) != null
                    ? _ReflectApply
                    : function flags() {
                          const string = ReflectApply(RegExProtoToString, this, [])
                          return ReflectApply(RegExpProtoExec, FLAGS_REG_EXP, [string])[0]
                      }
                : undefined
            const RegExpProtoSourceGetter = ReflectApply(ObjectProtoLookupGetter, RegExpProto, ['source'])
            const {
                replace: StringProtoReplace,
                slice: StringProtoSlice,
                valueOf: StringProtoValueOf,
            } = StringCtor.prototype
            const { toString: SymbolProtoToString, valueOf: SymbolProtoValueOf } = SymbolCtor.prototype
            const BigInt64ArrayProto =
                (_globalThisRef$BigInt = globalThisRef.BigInt64Array) == null ? void 0 : _globalThisRef$BigInt.prototype
            const BigUint64ArrayProto =
                (_globalThisRef$BigUin = globalThisRef.BigUint64Array) == null
                    ? void 0
                    : _globalThisRef$BigUin.prototype
            const { prototype: Float32ArrayProto } = _.Float32Array
            const { prototype: Float64ArrayProto } = _.Float64Array
            const { prototype: Int8ArrayProto } = _.Int8Array
            const { prototype: Int16ArrayProto } = _.Int16Array
            const { prototype: Int32ArrayProto } = _.Int32Array
            const { prototype: Uint8ArrayProto } = _.Uint8Array
            const { prototype: Uint16ArrayProto } = _.Uint16Array
            const { prototype: Uint32ArrayProto } = _.Uint32Array // eslint-disable-next-line no-proto
            const TypedArrayProto = Uint8ArrayProto.__proto__
            const TypedArrayProtoLengthGetter = ReflectApply(ObjectProtoLookupGetter, TypedArrayProto, ['length'])
            const { prototype: WeakMapProto } = WeakMapCtor
            const {
                delete: WeakMapProtoDelete,
                has: WeakMapProtoHas,
                set: WeakMapProtoSet,
                [SymbolToStringTag]: WeakMapProtoSymbolToStringTag,
            } = WeakMapProto
            const { prototype: WeakSetProto } = WeakSetCtor
            const {
                add: WeakSetProtoAdd,
                has: WeakSetProtoHas,
                delete: WeakSetProtoDelete,
                [SymbolToStringTag]: WeakSetProtoSymbolToStringTag,
            } = WeakSetProto
            const consoleObject =
                !IS_IN_SHADOW_REALM && typeof _.console === 'object' && _.console !== null ? _.console : undefined
            const consoleInfo = consoleObject == null ? void 0 : consoleObject.info
            const localEval = IS_IN_SHADOW_REALM ? _.eval : undefined // Install flags to ensure things are installed once per realm.
            let installedErrorPrepareStackTraceFlag = false
            let installedPropertyDescriptorMethodWrappersFlag = false
            function alwaysFalse() {
                return false
            }
            const installErrorPrepareStackTrace = LOCKER_UNMINIFIED_FLAG
                ? () => {
                      if (installedErrorPrepareStackTraceFlag) {
                          return
                      }
                      installedErrorPrepareStackTraceFlag = true // Feature detect the V8 stack trace API.
                      // https://v8.dev/docs/stack-trace-api
                      const CallSite = (() => {
                          try {
                              var _callSites$
                              ErrorCtor.prepareStackTrace = (_error, callSites) => callSites
                              const callSites = new ErrorCtor().stack
                              ReflectDeleteProperty(ErrorCtor, 'prepareStackTrace')
                              return isArrayOrThrowForRevoked(callSites) && callSites.length > 0
                                  ? (_callSites$ = callSites[0]) == null
                                      ? void 0
                                      : _callSites$.constructor
                                  : undefined // eslint-disable-next-line no-empty
                          } catch (_unused) {}
                          return undefined
                      })()
                      if (typeof CallSite !== 'function') {
                          return
                      }
                      const {
                          getEvalOrigin: CallSiteProtoGetEvalOrigin,
                          getFunctionName: CallSiteProtoGetFunctionName,
                          toString: CallSiteProtoToString,
                      } = CallSite.prototype // A regexp to detect call sites containing LOCKER_IDENTIFIER_MARKER.
                      const lockerFunctionNameMarkerRegExp = new RegExpCtor(
                          `${
                              ReflectApply(StringProtoReplace, LOCKER_IDENTIFIER_MARKER, [
                                  /[\\^$.*+?()[\]{}|]/g,
                                  '\\$&',
                              ]) // Function name references in call sites also contain
                          }(?=\\.|$)`,
                      )
                      const formatStackTrace = function formatStackTrace1(error, callSites) {
                          // Based on V8's default stack trace formatting:
                          // https://chromium.googlesource.com/v8/v8.git/+/refs/heads/main/src/execution/messages.cc#371
                          let stackTrace = ''
                          try {
                              stackTrace = ReflectApply(ErrorProtoToString, error, [])
                          } catch (_unused2) {
                              stackTrace = '<error>'
                          }
                          let consecutive = false
                          for (let i = 0, { length } = callSites; i < length; i += 1) {
                              const callSite = callSites[i]
                              const funcName = ReflectApply(CallSiteProtoGetFunctionName, callSite, [])
                              let isMarked = false
                              if (
                                  typeof funcName === 'string' &&
                                  funcName !== 'eval' &&
                                  ReflectApply(RegExpProtoTest, lockerFunctionNameMarkerRegExp, [funcName])
                              ) {
                                  isMarked = true
                              }
                              if (!isMarked) {
                                  const evalOrigin = ReflectApply(CallSiteProtoGetEvalOrigin, callSite, [])
                                  if (
                                      typeof evalOrigin === 'string' &&
                                      ReflectApply(RegExpProtoTest, lockerFunctionNameMarkerRegExp, [evalOrigin])
                                  ) {
                                      isMarked = true
                                  }
                              } // Only write a single LWS entry per consecutive LWS stacks.
                              if (isMarked) {
                                  if (!consecutive) {
                                      consecutive = true
                                      stackTrace += '\n    at LWS'
                                  }
                                  continue
                              } else {
                                  consecutive = false
                              }
                              try {
                                  stackTrace += `\n    at ${ReflectApply(CallSiteProtoToString, callSite, [])}` // eslint-disable-next-line no-empty
                              } catch (_unused3) {}
                          }
                          return stackTrace
                      }
                      try {
                          // Error.prepareStackTrace cannot be a bound or proxy wrapped
                          // function, so to obscure its source we wrap the call to
                          // formatStackTrace().
                          ErrorCtor.prepareStackTrace = function prepareStackTrace(error, callSites) {
                              return formatStackTrace(error, callSites)
                          } // eslint-disable-next-line no-empty
                      } catch (_unused4) {}
                      try {
                          const { stackTraceLimit } = ErrorCtor
                          if (typeof stackTraceLimit !== 'number' || stackTraceLimit < LOCKER_STACK_TRACE_LIMIT) {
                              ErrorCtor.stackTraceLimit = LOCKER_STACK_TRACE_LIMIT
                          } // eslint-disable-next-line no-empty
                      } catch (_unused5) {}
                  }
                : noop
            function noop() {}
            const serializeBigIntObject = IS_IN_SHADOW_REALM
                ? (
                      bigIntObject, // https://tc39.es/ecma262/#thisbigintvalue
                  ) =>
                      // Step 2: If Type(value) is Object and value has a [[BigIntData]] internal slot, then
                      //     a. Assert: Type(value.[[BigIntData]]) is BigInt.
                      ReflectApply(BigIntProtoValueOf, bigIntObject, [])
                : noop
            const serializeBooleanObject = IS_IN_SHADOW_REALM
                ? (
                      booleanObject, // https://tc39.es/ecma262/#thisbooleanvalue
                  ) =>
                      // Step 2: If Type(value) is Object and value has a [[BooleanData]] internal slot, then
                      //     a. Let b be value.[[BooleanData]].
                      //     b. Assert: Type(b) is Boolean.
                      ReflectApply(BooleanProtoValueOf, booleanObject, [])
                : noop
            const serializeNumberObject = IS_IN_SHADOW_REALM
                ? (
                      numberObject, // https://tc39.es/ecma262/#thisnumbervalue
                  ) =>
                      // Step 2: If Type(value) is Object and value has a [[NumberData]] internal slot, then
                      //     a. Let n be value.[[NumberData]].
                      //     b. Assert: Type(n) is Number.
                      ReflectApply(NumberProtoValueOf, numberObject, [])
                : noop
            const serializeRegExp = IS_IN_SHADOW_REALM
                ? (value) => {
                      // 22.2.5.12 get RegExp.prototype.source
                      // https://tc39.es/ecma262/#sec-get-regexp.prototype.source
                      // Step 3: If R does not have an [[OriginalSource]] internal slot, then
                      //     a. If SameValue(R, %RegExp.prototype%) is true, return "(?:)".
                      //     b. Otherwise, throw a TypeError exception.
                      if (value !== RegExpProto) {
                          const source = ReflectApply(RegExpProtoSourceGetter, value, [])
                          return JSONStringify({
                              __proto__: null,
                              flags: ReflectApply(RegExpProtoFlagsGetter, value, []),
                              source,
                          })
                      }
                      return undefined
                  }
                : noop
            const serializeStringObject = IS_IN_SHADOW_REALM
                ? (
                      stringObject, // https://tc39.es/ecma262/#thisstringvalue
                  ) =>
                      // Step 2: If Type(value) is Object and value has a [[StringData]] internal slot, then
                      //     a. Let s be value.[[StringData]].
                      //     b. Assert: Type(s) is String.
                      ReflectApply(StringProtoValueOf, stringObject, [])
                : noop
            const serializeSymbolObject = IS_IN_SHADOW_REALM
                ? (
                      symbolObject, // https://tc39.es/ecma262/#thissymbolvalue
                  ) =>
                      // Step 2: If Type(value) is Object and value has a [[SymbolData]] internal slot, then
                      //     a. Let s be value.[[SymbolData]].
                      //     b. Assert: Type(s) is Symbol.
                      ReflectApply(SymbolProtoValueOf, symbolObject, [])
                : noop
            const serializeTargetByBrand = IS_IN_SHADOW_REALM
                ? (target) => {
                      const brand = ReflectApply(ObjectProtoToString, target, [])
                      switch (brand) {
                          // The brand checks below represent boxed primitives of
                          // `ESGlobalKeys` in packages/near-membrane-base/src/intrinsics.ts
                          // which are not remapped or reflective.
                          case '[object Boolean]':
                              return serializeBooleanObject(target)
                          case '[object Number]':
                              return serializeNumberObject(target)
                          case '[object RegExp]':
                              return serializeRegExp(target)
                          case '[object String]':
                              return serializeStringObject(target)
                          case '[object Object]':
                              try {
                                  // Symbol.prototype[@@toStringTag] is defined by default so
                                  // must have been removed.
                                  // https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
                                  return serializeSymbolObject(target) // eslint-disable-next-line no-empty
                              } catch (_unused6) {}
                              if (SUPPORTS_BIG_INT) {
                                  // BigInt.prototype[@@toStringTag] is defined by default so
                                  // must have been removed.
                                  // https://tc39.es/ecma262/#sec-bigint.prototype-@@tostringtag
                                  try {
                                      return serializeBigIntObject(target) // eslint-disable-next-line no-empty
                                  } catch (_unused7) {}
                              }
                          // eslint-disable-next-line no-fallthrough
                          default:
                              return undefined
                      }
                  }
                : noop
            const serializeTargetByTrialAndError = IS_IN_SHADOW_REALM
                ? (target) => {
                      // The serialization attempts below represent boxed primitives of
                      // `ESGlobalKeys` in packages/near-membrane-base/src/intrinsics.ts
                      // which are not remapped or reflective.
                      try {
                          // Symbol.prototype[@@toStringTag] is defined by default so
                          // attempted before others.
                          // https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
                          return serializeSymbolObject(target) // eslint-disable-next-line no-empty
                      } catch (_unused8) {}
                      if (SUPPORTS_BIG_INT) {
                          // BigInt.prototype[@@toStringTag] is defined by default so
                          // attempted before others.
                          // https://tc39.es/ecma262/#sec-bigint.prototype-@@tostringtag
                          try {
                              return serializeBigIntObject(target) // eslint-disable-next-line no-empty
                          } catch (_unused9) {}
                      }
                      try {
                          return serializeBooleanObject(target) // eslint-disable-next-line no-empty
                      } catch (_unused10) {}
                      try {
                          return serializeNumberObject(target) // eslint-disable-next-line no-empty
                      } catch (_unused11) {}
                      try {
                          return serializeRegExp(target) // eslint-disable-next-line no-empty
                      } catch (_unused12) {}
                      try {
                          return serializeStringObject(target) // eslint-disable-next-line no-empty
                      } catch (_unused13) {}
                      return undefined
                  }
                : noop
            function toSafeTemplateStringValue(value) {
                if (typeof value === 'string') {
                    return value
                }
                try {
                    if (typeof value === 'object' && value !== null) {
                        const result = ReflectApply(ObjectProtoToString, value, [])
                        return result === '[object Symbol]' ? ReflectApply(SymbolProtoToString, value, []) : result
                    }
                    if (typeof value === 'function') {
                        return ReflectApply(FunctionProtoToString, value, [])
                    } // Attempt to coerce `value` to a string with the String() constructor.
                    // Section 22.1.1.1 String ( value )
                    // https://tc39.es/ecma262/#sec-string-constructor-string-value
                    return StringCtor(value) // eslint-disable-next-line no-empty
                } catch (_unused14) {}
                return '[Object Unknown]'
            } // eslint-disable-next-line @typescript-eslint/no-shadow, no-shadow
            function toSafeWeakMap(weakMap) {
                ReflectSetPrototypeOf(weakMap, null)
                weakMap.delete = WeakMapProtoDelete
                weakMap.has = WeakMapProtoHas
                weakMap.set = WeakMapProtoSet
                weakMap[SymbolToStringTag] = WeakMapProtoSymbolToStringTag
                ReflectSetPrototypeOf(weakMap, WeakMapProto)
                return weakMap
            }
            function toSafeWeakSet(weakSet) {
                ReflectSetPrototypeOf(weakSet, null)
                weakSet.add = WeakSetProtoAdd
                weakSet.delete = WeakSetProtoDelete
                weakSet.has = WeakSetProtoHas
                weakSet[SymbolToStringTag] = WeakSetProtoSymbolToStringTag
                ReflectSetPrototypeOf(weakSet, WeakSetProto)
                return weakSet
            }
            return function createHooksCallback(color, foreignCallableHooksCallback, options) {
                if (IS_IN_SHADOW_REALM) {
                    options = undefined
                }
                const {
                    distortionCallback,
                    instrumentation,
                    liveTargetCallback, // eslint-disable-next-line prefer-object-spread
                } = ObjectAssign(
                    {
                        __proto__: null,
                    },
                    options,
                )
                const LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG = // definition with a LOCKER_UNMINIFIED_FLAG check to have instrumentation
                    // removed in minified production builds.
                    !IS_IN_SHADOW_REALM && typeof instrumentation === 'object' && instrumentation !== null
                const arityToApplyTrapNameRegistry = {
                    // Populated in the returned connector function below.
                    __proto__: null,
                    0: undefined,
                    1: undefined,
                    2: undefined,
                    3: undefined,
                    4: undefined,
                    n: undefined,
                }
                const arityToConstructTrapNameRegistry = {
                    // Populated in the returned connector function below.
                    __proto__: null,
                    0: undefined,
                    1: undefined,
                    2: undefined,
                    3: undefined,
                    4: undefined,
                    n: undefined,
                }
                const localProxyTargetToLazyPropertyDescriptorStateMap = toSafeWeakMap(new WeakMapCtor())
                const proxyTargetToPointerMap = toSafeWeakMap(new WeakMapCtor())
                const startActivity = LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG ? instrumentation.startActivity : undefined
                let foreignCallablePushErrorTarget
                let foreignCallablePushTarget
                let foreignCallableApply
                let foreignCallableConstruct
                let foreignCallableDefineProperty
                let foreignCallableDeleteProperty
                let foreignCallableGet
                let foreignCallableGetOwnPropertyDescriptor
                let foreignCallableGetPrototypeOf
                let foreignCallableHas
                let foreignCallableIsExtensible
                let foreignCallableOwnKeys
                let foreignCallablePreventExtensions
                let foreignCallableSet
                let foreignCallableSetPrototypeOf
                let foreignCallableDebugInfo
                let foreignCallableGetPropertyValue
                let foreignCallableGetLazyPropertyDescriptorStateByTarget
                let foreignCallableGetTargetIntegrityTraits
                let foreignCallableGetToStringTagOfTarget
                let foreignCallableInstallErrorPrepareStackTrace
                let foreignCallableIsTargetLive
                let foreignCallableIsTargetRevoked
                let foreignCallableSerializeTarget
                let foreignCallableSetLazyPropertyDescriptorStateByTarget
                let foreignCallableBatchGetPrototypeOfAndGetOwnPropertyDescriptors
                let foreignCallableBatchGetPrototypeOfWhenHasNoOwnProperty
                let foreignCallableBatchGetPrototypeOfWhenHasNoOwnPropertyDescriptor
                let fastForeignTargetPointers
                let foreignPointerBigInt64ArrayProto
                let foreignPointerBigUint64ArrayProto
                let foreignPointerFloat32ArrayProto
                let foreignPointerFloat64ArrayProto
                let foreignPointerInt8ArrayProto
                let foreignPointerInt16ArrayProto
                let foreignPointerInt32ArrayProto
                let foreignPointerObjectProto
                let foreignPointerTypedArrayProto
                let foreignPointerUint8ArrayProto
                let foreignPointerUint16ArrayProto
                let foreignPointerUint32ArrayProto
                let selectedTarget
                let useFastForeignTargetPath = true
                let useFastForeignTargetPathForTypedArrays = true
                let nearMembraneSymbolFlag = false
                let lastProxyTrapCalled = 0
                const activateLazyOwnPropertyDefinition = IS_IN_SHADOW_REALM
                    ? (target, key, state) => {
                          state[key] = false
                          const foreignTargetPointer = getTransferablePointer(target)
                          let safeDesc
                          try {
                              foreignCallableGetOwnPropertyDescriptor(
                                  foreignTargetPointer,
                                  key,
                                  (
                                      _key,
                                      configurable,
                                      enumerable,
                                      writable,
                                      valuePointer,
                                      getterPointer,
                                      setterPointer,
                                  ) => {
                                      safeDesc = createDescriptorFromMeta(
                                          configurable,
                                          enumerable,
                                          writable,
                                          valuePointer,
                                          getterPointer,
                                          setterPointer,
                                      )
                                  },
                              )
                          } catch (error) {
                              var _selectedTarget
                              const errorToThrow = (_selectedTarget = selectedTarget) != null ? _selectedTarget : error
                              selectedTarget = undefined
                              throw errorToThrow
                          }
                          if (safeDesc) {
                              ReflectDefineProperty(target, key, safeDesc)
                          } else {
                              ReflectDeleteProperty(target, key)
                          }
                      }
                    : noop
                let checkDebugMode = LOCKER_DEBUGGABLE_FLAG
                    ? () => {
                          try {
                              if (ObjectHasOwn(globalThisRef, LOCKER_DEBUG_MODE_SYMBOL)) {
                                  checkDebugMode = () => true
                                  installErrorPrepareStackTrace()
                                  foreignCallableInstallErrorPrepareStackTrace()
                              }
                          } catch (_unused15) {
                              checkDebugMode = alwaysFalse
                          }
                          return false
                      }
                    : alwaysFalse
                const clearFastForeignTargetPointers = IS_IN_SHADOW_REALM
                    ? () => {
                          fastForeignTargetPointers = toSafeWeakSet(new WeakSetCtor())
                      }
                    : noop
                function copyForeignOwnPropertyDescriptorsAndPrototypeToShadowTarget(
                    foreignTargetPointer,
                    shadowTarget,
                ) {
                    let activity
                    if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                        activity = startActivity('copyForeignOwnPropertyDescriptorsAndPrototypeToShadowTarget')
                    }
                    let protoPointerOrNull
                    try {
                        protoPointerOrNull = foreignCallableBatchGetPrototypeOfAndGetOwnPropertyDescriptors(
                            foreignTargetPointer,
                            (...descriptorTuples) => {
                                const descriptors = {}
                                for (let i = 0, { length } = descriptorTuples; i < length; i += 7) {
                                    const key = descriptorTuples[i]
                                    descriptors[key] = createDescriptorFromMeta(
                                        descriptorTuples[i + 1],
                                        descriptorTuples[i + 2],
                                        descriptorTuples[i + 3],
                                        descriptorTuples[i + 4],
                                        descriptorTuples[i + 5],
                                        descriptorTuples[i + 6], // setterPointer
                                    )
                                } // Use `ObjectDefineProperties()` instead of individual
                                // `ReflectDefineProperty()` calls for better performance.
                                ObjectDefineProperties(shadowTarget, descriptors)
                            },
                        )
                    } catch (error) {
                        var _selectedTarget2
                        const errorToThrow = (_selectedTarget2 = selectedTarget) != null ? _selectedTarget2 : error
                        selectedTarget = undefined
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.error(errorToThrow)
                        }
                        throw errorToThrow
                    }
                    let proto
                    if (typeof protoPointerOrNull === 'function') {
                        protoPointerOrNull()
                        proto = selectedTarget
                        selectedTarget = undefined
                    } else {
                        proto = null
                    }
                    ReflectSetPrototypeOf(shadowTarget, proto)
                    if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                        activity.stop()
                    }
                }
                function createApplyOrConstructTrapForZeroOrMoreArgs(proxyTrapEnum) {
                    const isApplyTrap = proxyTrapEnum & 1 /* ProxyHandlerTraps.Apply */
                    const activityName = `Reflect.${isApplyTrap ? 'apply' : 'construct'}()`
                    const arityToApplyOrConstructTrapNameRegistry = isApplyTrap
                        ? arityToApplyTrapNameRegistry
                        : arityToConstructTrapNameRegistry
                    const foreignCallableApplyOrConstruct = isApplyTrap
                        ? foreignCallableApply
                        : foreignCallableConstruct
                    return function applyOrConstructTrap(shadowTarget, thisArgOrArgs, argsOrNewTarget) {
                        lastProxyTrapCalled = proxyTrapEnum
                        const args = isApplyTrap ? argsOrNewTarget : thisArgOrArgs
                        const { length } = args
                        if (length !== 0) {
                            var _arityToApplyOrConstr
                            return this[
                                (_arityToApplyOrConstr = arityToApplyOrConstructTrapNameRegistry[length]) != null
                                    ? _arityToApplyOrConstr
                                    : arityToApplyOrConstructTrapNameRegistry.n
                            ](shadowTarget, thisArgOrArgs, argsOrNewTarget)
                        }
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity(activityName)
                        } // @ts-ignore: Prevent private property access error.
                        const { foreignTargetPointer: foreignTargetPointer1 } = this
                        const thisArgOrNewTarget = isApplyTrap ? thisArgOrArgs : argsOrNewTarget
                        let pointerOrPrimitive
                        try {
                            pointerOrPrimitive = foreignCallableApplyOrConstruct(
                                foreignTargetPointer1,
                                (typeof thisArgOrNewTarget === 'object' && thisArgOrNewTarget !== null) ||
                                    typeof thisArgOrNewTarget === 'function'
                                    ? getTransferablePointer(thisArgOrNewTarget) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof thisArgOrNewTarget === 'undefined'
                                    ? undefined
                                    : thisArgOrNewTarget,
                            )
                        } catch (error) {
                            var _selectedTarget3
                            const errorToThrow = (_selectedTarget3 = selectedTarget) != null ? _selectedTarget3 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        let result
                        if (typeof pointerOrPrimitive === 'function') {
                            pointerOrPrimitive()
                            result = selectedTarget
                            selectedTarget = undefined
                        } else {
                            result = pointerOrPrimitive
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                }
                function createApplyOrConstructTrapForOneOrMoreArgs(proxyTrapEnum) {
                    const isApplyTrap = proxyTrapEnum & 1 /* ProxyHandlerTraps.Apply */
                    const activityName = `Reflect.${isApplyTrap ? 'apply' : 'construct'}(1)`
                    const arityToApplyOrConstructTrapNameRegistry = isApplyTrap
                        ? arityToApplyTrapNameRegistry
                        : arityToConstructTrapNameRegistry
                    const foreignCallableApplyOrConstruct = isApplyTrap
                        ? foreignCallableApply
                        : foreignCallableConstruct
                    return function applyOrConstructTrapForOneOrMoreArgs(shadowTarget, thisArgOrArgs, argsOrNewTarget) {
                        lastProxyTrapCalled = proxyTrapEnum
                        const args = isApplyTrap ? argsOrNewTarget : thisArgOrArgs
                        const { length } = args
                        if (length !== 1) {
                            var _arityToApplyOrConstr2
                            return this[
                                (_arityToApplyOrConstr2 = arityToApplyOrConstructTrapNameRegistry[length]) != null
                                    ? _arityToApplyOrConstr2
                                    : arityToApplyOrConstructTrapNameRegistry.n
                            ](shadowTarget, thisArgOrArgs, argsOrNewTarget)
                        }
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity(activityName)
                        } // @ts-ignore: Prevent private property access error.
                        const { foreignTargetPointer: foreignTargetPointer1 } = this
                        const thisArgOrNewTarget = isApplyTrap ? thisArgOrArgs : argsOrNewTarget
                        let pointerOrPrimitive
                        try {
                            const { 0: arg0 } = args
                            pointerOrPrimitive = foreignCallableApplyOrConstruct(
                                foreignTargetPointer1,
                                (typeof thisArgOrNewTarget === 'object' && thisArgOrNewTarget !== null) ||
                                    typeof thisArgOrNewTarget === 'function'
                                    ? getTransferablePointer(thisArgOrNewTarget) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof thisArgOrNewTarget === 'undefined'
                                    ? undefined
                                    : thisArgOrNewTarget,
                                (typeof arg0 === 'object' && arg0 !== null) || typeof arg0 === 'function'
                                    ? getTransferablePointer(arg0) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg0 === 'undefined'
                                    ? undefined
                                    : arg0,
                            )
                        } catch (error) {
                            var _selectedTarget4
                            const errorToThrow = (_selectedTarget4 = selectedTarget) != null ? _selectedTarget4 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        let result
                        if (typeof pointerOrPrimitive === 'function') {
                            pointerOrPrimitive()
                            result = selectedTarget
                            selectedTarget = undefined
                        } else {
                            result = pointerOrPrimitive
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                }
                function createApplyOrConstructTrapForTwoOrMoreArgs(proxyTrapEnum) {
                    const isApplyTrap = proxyTrapEnum & 1 /* ProxyHandlerTraps.Apply */
                    const activityName = `Reflect.${isApplyTrap ? 'apply' : 'construct'}(2)`
                    const arityToApplyOrConstructTrapNameRegistry = isApplyTrap
                        ? arityToApplyTrapNameRegistry
                        : arityToConstructTrapNameRegistry
                    const foreignCallableApplyOrConstruct = isApplyTrap
                        ? foreignCallableApply
                        : foreignCallableConstruct
                    return function applyOrConstructTrapForTwoOrMoreArgs(shadowTarget, thisArgOrArgs, argsOrNewTarget) {
                        lastProxyTrapCalled = proxyTrapEnum
                        const args = isApplyTrap ? argsOrNewTarget : thisArgOrArgs
                        const { length } = args
                        if (length !== 2) {
                            var _arityToApplyOrConstr3
                            return this[
                                (_arityToApplyOrConstr3 = arityToApplyOrConstructTrapNameRegistry[length]) != null
                                    ? _arityToApplyOrConstr3
                                    : arityToApplyOrConstructTrapNameRegistry.n
                            ](shadowTarget, thisArgOrArgs, argsOrNewTarget)
                        }
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity(activityName)
                        } // @ts-ignore: Prevent private property access error.
                        const { foreignTargetPointer: foreignTargetPointer1 } = this
                        const thisArgOrNewTarget = isApplyTrap ? thisArgOrArgs : argsOrNewTarget
                        let pointerOrPrimitive
                        try {
                            const { 0: arg0, 1: arg1 } = args
                            pointerOrPrimitive = foreignCallableApplyOrConstruct(
                                foreignTargetPointer1,
                                (typeof thisArgOrNewTarget === 'object' && thisArgOrNewTarget !== null) ||
                                    typeof thisArgOrNewTarget === 'function'
                                    ? getTransferablePointer(thisArgOrNewTarget) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof thisArgOrNewTarget === 'undefined'
                                    ? undefined
                                    : thisArgOrNewTarget,
                                (typeof arg0 === 'object' && arg0 !== null) || typeof arg0 === 'function'
                                    ? getTransferablePointer(arg0) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg0 === 'undefined'
                                    ? undefined
                                    : arg0,
                                (typeof arg1 === 'object' && arg1 !== null) || typeof arg1 === 'function'
                                    ? getTransferablePointer(arg1) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg1 === 'undefined'
                                    ? undefined
                                    : arg1,
                            )
                        } catch (error) {
                            var _selectedTarget5
                            const errorToThrow = (_selectedTarget5 = selectedTarget) != null ? _selectedTarget5 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        let result
                        if (typeof pointerOrPrimitive === 'function') {
                            pointerOrPrimitive()
                            result = selectedTarget
                            selectedTarget = undefined
                        } else {
                            result = pointerOrPrimitive
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                }
                function createApplyOrConstructTrapForThreeOrMoreArgs(proxyTrapEnum) {
                    const isApplyTrap = proxyTrapEnum & 1 /* ProxyHandlerTraps.Apply */
                    const activityName = `Reflect.${isApplyTrap ? 'apply' : 'construct'}(3)`
                    const arityToApplyOrConstructTrapNameRegistry = isApplyTrap
                        ? arityToApplyTrapNameRegistry
                        : arityToConstructTrapNameRegistry
                    const foreignCallableApplyOrConstruct = isApplyTrap
                        ? foreignCallableApply
                        : foreignCallableConstruct
                    return function applyOrConstructTrapForTwoOrMoreArgs(shadowTarget, thisArgOrArgs, argsOrNewTarget) {
                        lastProxyTrapCalled = proxyTrapEnum
                        const args = isApplyTrap ? argsOrNewTarget : thisArgOrArgs
                        const { length } = args
                        if (length !== 3) {
                            var _arityToApplyOrConstr4
                            return this[
                                (_arityToApplyOrConstr4 = arityToApplyOrConstructTrapNameRegistry[length]) != null
                                    ? _arityToApplyOrConstr4
                                    : arityToApplyOrConstructTrapNameRegistry.n
                            ](shadowTarget, thisArgOrArgs, argsOrNewTarget)
                        }
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity(activityName)
                        } // @ts-ignore: Prevent private property access error.
                        const { foreignTargetPointer: foreignTargetPointer1 } = this
                        const thisArgOrNewTarget = isApplyTrap ? thisArgOrArgs : argsOrNewTarget
                        let pointerOrPrimitive
                        try {
                            const { 0: arg0, 1: arg1, 2: arg2 } = args
                            pointerOrPrimitive = foreignCallableApplyOrConstruct(
                                foreignTargetPointer1,
                                (typeof thisArgOrNewTarget === 'object' && thisArgOrNewTarget !== null) ||
                                    typeof thisArgOrNewTarget === 'function'
                                    ? getTransferablePointer(thisArgOrNewTarget) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof thisArgOrNewTarget === 'undefined'
                                    ? undefined
                                    : thisArgOrNewTarget,
                                (typeof arg0 === 'object' && arg0 !== null) || typeof arg0 === 'function'
                                    ? getTransferablePointer(arg0) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg0 === 'undefined'
                                    ? undefined
                                    : arg0,
                                (typeof arg1 === 'object' && arg1 !== null) || typeof arg1 === 'function'
                                    ? getTransferablePointer(arg1) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg1 === 'undefined'
                                    ? undefined
                                    : arg1,
                                (typeof arg2 === 'object' && arg2 !== null) || typeof arg2 === 'function'
                                    ? getTransferablePointer(arg2) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg2 === 'undefined'
                                    ? undefined
                                    : arg2,
                            )
                        } catch (error) {
                            var _selectedTarget6
                            const errorToThrow = (_selectedTarget6 = selectedTarget) != null ? _selectedTarget6 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        let result
                        if (typeof pointerOrPrimitive === 'function') {
                            pointerOrPrimitive()
                            result = selectedTarget
                            selectedTarget = undefined
                        } else {
                            result = pointerOrPrimitive
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                }
                function createApplyOrConstructTrapForFourOrMoreArgs(proxyTrapEnum) {
                    const isApplyTrap = proxyTrapEnum & 1 /* ProxyHandlerTraps.Apply */
                    const activityName = `Reflect.${isApplyTrap ? 'apply' : 'construct'}(4)`
                    const arityToApplyOrConstructTrapNameRegistry = isApplyTrap
                        ? arityToApplyTrapNameRegistry
                        : arityToConstructTrapNameRegistry
                    const foreignCallableApplyOrConstruct = isApplyTrap
                        ? foreignCallableApply
                        : foreignCallableConstruct
                    return function applyOrConstructTrapForTwoOrMoreArgs(shadowTarget, thisArgOrArgs, argsOrNewTarget) {
                        lastProxyTrapCalled = proxyTrapEnum
                        const args = isApplyTrap ? argsOrNewTarget : thisArgOrArgs
                        const { length } = args
                        if (length !== 4) {
                            var _arityToApplyOrConstr5
                            return this[
                                (_arityToApplyOrConstr5 = arityToApplyOrConstructTrapNameRegistry[length]) != null
                                    ? _arityToApplyOrConstr5
                                    : arityToApplyOrConstructTrapNameRegistry.n
                            ](shadowTarget, thisArgOrArgs, argsOrNewTarget)
                        }
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity(activityName)
                        } // @ts-ignore: Prevent private property access error.
                        const { foreignTargetPointer: foreignTargetPointer1 } = this
                        const thisArgOrNewTarget = isApplyTrap ? thisArgOrArgs : argsOrNewTarget
                        let pointerOrPrimitive
                        try {
                            const { 0: arg0, 1: arg1, 2: arg2, 3: arg3 } = args
                            pointerOrPrimitive = foreignCallableApplyOrConstruct(
                                foreignTargetPointer1,
                                (typeof thisArgOrNewTarget === 'object' && thisArgOrNewTarget !== null) ||
                                    typeof thisArgOrNewTarget === 'function'
                                    ? getTransferablePointer(thisArgOrNewTarget) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof thisArgOrNewTarget === 'undefined'
                                    ? undefined
                                    : thisArgOrNewTarget,
                                (typeof arg0 === 'object' && arg0 !== null) || typeof arg0 === 'function'
                                    ? getTransferablePointer(arg0) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg0 === 'undefined'
                                    ? undefined
                                    : arg0,
                                (typeof arg1 === 'object' && arg1 !== null) || typeof arg1 === 'function'
                                    ? getTransferablePointer(arg1) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg1 === 'undefined'
                                    ? undefined
                                    : arg1,
                                (typeof arg2 === 'object' && arg2 !== null) || typeof arg2 === 'function'
                                    ? getTransferablePointer(arg2) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg2 === 'undefined'
                                    ? undefined
                                    : arg2,
                                (typeof arg3 === 'object' && arg3 !== null) || typeof arg3 === 'function'
                                    ? getTransferablePointer(arg3) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg3 === 'undefined'
                                    ? undefined
                                    : arg3,
                            )
                        } catch (error) {
                            var _selectedTarget7
                            const errorToThrow = (_selectedTarget7 = selectedTarget) != null ? _selectedTarget7 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        let result
                        if (typeof pointerOrPrimitive === 'function') {
                            pointerOrPrimitive()
                            result = selectedTarget
                            selectedTarget = undefined
                        } else {
                            result = pointerOrPrimitive
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                }
                function createApplyOrConstructTrapForFiveOrMoreArgs(proxyTrapEnum) {
                    const isApplyTrap = proxyTrapEnum & 1 /* ProxyHandlerTraps.Apply */
                    const activityName = `Reflect.${isApplyTrap ? 'apply' : 'construct'}(5)`
                    const arityToApplyOrConstructTrapNameRegistry = isApplyTrap
                        ? arityToApplyTrapNameRegistry
                        : arityToConstructTrapNameRegistry
                    const foreignCallableApplyOrConstruct = isApplyTrap
                        ? foreignCallableApply
                        : foreignCallableConstruct
                    return function applyOrConstructTrapForTwoOrMoreArgs(shadowTarget, thisArgOrArgs, argsOrNewTarget) {
                        lastProxyTrapCalled = proxyTrapEnum
                        const args = isApplyTrap ? argsOrNewTarget : thisArgOrArgs
                        const { length } = args
                        if (length !== 5) {
                            var _arityToApplyOrConstr6
                            return this[
                                (_arityToApplyOrConstr6 = arityToApplyOrConstructTrapNameRegistry[length]) != null
                                    ? _arityToApplyOrConstr6
                                    : arityToApplyOrConstructTrapNameRegistry.n
                            ](shadowTarget, thisArgOrArgs, argsOrNewTarget)
                        }
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity(activityName)
                        } // @ts-ignore: Prevent private property access error.
                        const { foreignTargetPointer: foreignTargetPointer1 } = this
                        const thisArgOrNewTarget = isApplyTrap ? thisArgOrArgs : argsOrNewTarget
                        let pointerOrPrimitive
                        try {
                            const { 0: arg0, 1: arg1, 2: arg2, 3: arg3, 4: arg4 } = args
                            pointerOrPrimitive = foreignCallableApplyOrConstruct(
                                foreignTargetPointer1,
                                (typeof thisArgOrNewTarget === 'object' && thisArgOrNewTarget !== null) ||
                                    typeof thisArgOrNewTarget === 'function'
                                    ? getTransferablePointer(thisArgOrNewTarget) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof thisArgOrNewTarget === 'undefined'
                                    ? undefined
                                    : thisArgOrNewTarget,
                                (typeof arg0 === 'object' && arg0 !== null) || typeof arg0 === 'function'
                                    ? getTransferablePointer(arg0) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg0 === 'undefined'
                                    ? undefined
                                    : arg0,
                                (typeof arg1 === 'object' && arg1 !== null) || typeof arg1 === 'function'
                                    ? getTransferablePointer(arg1) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg1 === 'undefined'
                                    ? undefined
                                    : arg1,
                                (typeof arg2 === 'object' && arg2 !== null) || typeof arg2 === 'function'
                                    ? getTransferablePointer(arg2) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg2 === 'undefined'
                                    ? undefined
                                    : arg2,
                                (typeof arg3 === 'object' && arg3 !== null) || typeof arg3 === 'function'
                                    ? getTransferablePointer(arg3) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg3 === 'undefined'
                                    ? undefined
                                    : arg3,
                                (typeof arg4 === 'object' && arg4 !== null) || typeof arg4 === 'function'
                                    ? getTransferablePointer(arg4) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof arg4 === 'undefined'
                                    ? undefined
                                    : arg4,
                            )
                        } catch (error) {
                            var _selectedTarget8
                            const errorToThrow = (_selectedTarget8 = selectedTarget) != null ? _selectedTarget8 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        let result
                        if (typeof pointerOrPrimitive === 'function') {
                            pointerOrPrimitive()
                            result = selectedTarget
                            selectedTarget = undefined
                        } else {
                            result = pointerOrPrimitive
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                }
                function createApplyOrConstructTrapForAnyNumberOfArgs(proxyTrapEnum) {
                    const isApplyTrap = proxyTrapEnum & 1 /* ProxyHandlerTraps.Apply */
                    const nativeMethodName = isApplyTrap ? 'apply' : 'construct'
                    const foreignCallableApplyOrConstruct = isApplyTrap
                        ? foreignCallableApply
                        : foreignCallableConstruct
                    return function applyOrConstructTrapForAnyNumberOfArgs(
                        _shadowTarget,
                        thisArgOrArgs,
                        argsOrNewTarget,
                    ) {
                        lastProxyTrapCalled = proxyTrapEnum // @ts-ignore: Prevent private property access error.
                        const { foreignTargetPointer: foreignTargetPointer1 } = this
                        const args = isApplyTrap ? argsOrNewTarget : thisArgOrArgs
                        const { length } = args
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity(`Reflect.${nativeMethodName}(${length})`)
                        }
                        const thisArgOrNewTarget = isApplyTrap ? thisArgOrArgs : argsOrNewTarget
                        let combinedOffset = 2
                        const combinedArgs = new ArrayCtor(length + combinedOffset)
                        combinedArgs[0] = foreignTargetPointer1
                        let pointerOrPrimitive
                        try {
                            combinedArgs[1] =
                                (typeof thisArgOrNewTarget === 'object' && thisArgOrNewTarget !== null) ||
                                typeof thisArgOrNewTarget === 'function'
                                    ? getTransferablePointer(thisArgOrNewTarget) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof thisArgOrNewTarget === 'undefined'
                                    ? undefined
                                    : thisArgOrNewTarget
                            for (let i = 0; i < length; i += 1) {
                                const arg = args[i] // Inlining `getTransferableValue()`.
                                combinedArgs[combinedOffset++] =
                                    (typeof arg === 'object' && arg !== null) || typeof arg === 'function'
                                        ? getTransferablePointer(arg) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                        : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                        typeof arg === 'undefined'
                                        ? undefined
                                        : arg
                            }
                            pointerOrPrimitive = ReflectApply(foreignCallableApplyOrConstruct, undefined, combinedArgs)
                        } catch (error) {
                            var _selectedTarget9
                            const errorToThrow = (_selectedTarget9 = selectedTarget) != null ? _selectedTarget9 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        let result
                        if (typeof pointerOrPrimitive === 'function') {
                            pointerOrPrimitive()
                            result = selectedTarget
                            selectedTarget = undefined
                        } else {
                            result = pointerOrPrimitive
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                }
                function createDescriptorFromMeta(
                    configurable,
                    enumerable,
                    writable,
                    valuePointerOrPrimitive,
                    getterPointerOrPrimitive,
                    setterPointerOrPrimitive,
                ) {
                    const safeDesc = {
                        __proto__: null,
                    }
                    if (configurable !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                        safeDesc.configurable = configurable
                    }
                    if (enumerable !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                        safeDesc.enumerable = enumerable
                    }
                    if (writable !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                        safeDesc.writable = writable
                    }
                    if (getterPointerOrPrimitive !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                        if (typeof getterPointerOrPrimitive === 'function') {
                            getterPointerOrPrimitive()
                            safeDesc.get = selectedTarget
                            selectedTarget = undefined
                        } else {
                            safeDesc.get = undefined
                        }
                    }
                    if (setterPointerOrPrimitive !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                        if (typeof setterPointerOrPrimitive === 'function') {
                            setterPointerOrPrimitive()
                            safeDesc.set = selectedTarget
                            selectedTarget = undefined
                        } else {
                            safeDesc.set = undefined
                        }
                    }
                    if (valuePointerOrPrimitive !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                        if (typeof valuePointerOrPrimitive === 'function') {
                            valuePointerOrPrimitive()
                            safeDesc.value = selectedTarget
                            selectedTarget = undefined
                        } else {
                            safeDesc.value = valuePointerOrPrimitive
                        }
                    }
                    return safeDesc
                }
                function createPointer(originalTarget) {
                    const pointer = () => {
                        // assert: selectedTarget is undefined
                        selectedTarget = originalTarget
                    }
                    __.debugTargetBookkeeping?.(pointer, originalTarget)
                    return pointer
                }
                const disableFastForeignTargetPointers = IS_IN_SHADOW_REALM
                    ? () => {
                          useFastForeignTargetPath = false
                          useFastForeignTargetPathForTypedArrays = false
                          clearFastForeignTargetPointers()
                      }
                    : noop
                const getLazyPropertyDescriptorStateByTarget = IS_IN_SHADOW_REALM
                    ? (target) => {
                          let state = localProxyTargetToLazyPropertyDescriptorStateMap.get(target)
                          if (state === undefined) {
                              const statePointerOrUndefined = foreignCallableGetLazyPropertyDescriptorStateByTarget(
                                  getTransferablePointer(target),
                              )
                              if (typeof statePointerOrUndefined === 'function') {
                                  statePointerOrUndefined()
                                  state = selectedTarget
                                  selectedTarget = undefined
                                  if (state) {
                                      localProxyTargetToLazyPropertyDescriptorStateMap.set(target, state)
                                  }
                              }
                          }
                          return state
                      }
                    : noop
                const isForeignPointerOfObjectProto = IS_IN_SHADOW_REALM
                    ? (foreignTargetPointer) =>
                          foreignTargetPointer ===
                          (foreignPointerObjectProto === undefined
                              ? (foreignPointerObjectProto = getTransferablePointer(ObjectProto))
                              : foreignPointerObjectProto)
                    : alwaysFalse
                const isForeignPointerOfTypedArrayProto = IS_IN_SHADOW_REALM
                    ? (foreignTargetPointer) =>
                          foreignTargetPointer ===
                              (foreignPointerFloat32ArrayProto === undefined
                                  ? (foreignPointerFloat32ArrayProto = getTransferablePointer(Float32ArrayProto))
                                  : foreignPointerFloat32ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerFloat64ArrayProto === undefined
                                  ? (foreignPointerFloat64ArrayProto = getTransferablePointer(Float64ArrayProto))
                                  : foreignPointerFloat64ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerInt8ArrayProto === undefined
                                  ? (foreignPointerInt8ArrayProto = getTransferablePointer(Int8ArrayProto))
                                  : foreignPointerInt8ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerInt16ArrayProto === undefined
                                  ? (foreignPointerInt16ArrayProto = getTransferablePointer(Int16ArrayProto))
                                  : foreignPointerInt16ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerInt32ArrayProto === undefined
                                  ? (foreignPointerInt32ArrayProto = getTransferablePointer(Int32ArrayProto))
                                  : foreignPointerInt32ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerUint8ArrayProto === undefined
                                  ? (foreignPointerUint8ArrayProto = getTransferablePointer(Uint8ArrayProto))
                                  : foreignPointerUint8ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerUint16ArrayProto === undefined
                                  ? (foreignPointerUint16ArrayProto = getTransferablePointer(Uint16ArrayProto))
                                  : foreignPointerUint16ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerUint32ArrayProto === undefined
                                  ? (foreignPointerUint32ArrayProto = getTransferablePointer(Uint32ArrayProto))
                                  : foreignPointerUint32ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerTypedArrayProto === undefined
                                  ? (foreignPointerTypedArrayProto = getTransferablePointer(TypedArrayProto))
                                  : foreignPointerTypedArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerBigInt64ArrayProto === undefined
                                  ? (foreignPointerBigInt64ArrayProto = BigInt64ArrayProto
                                        ? getTransferablePointer(BigInt64ArrayProto)
                                        : noop)
                                  : foreignPointerBigInt64ArrayProto) ||
                          foreignTargetPointer ===
                              (foreignPointerBigUint64ArrayProto === undefined
                                  ? (foreignPointerBigUint64ArrayProto = BigUint64ArrayProto
                                        ? getTransferablePointer(BigUint64ArrayProto)
                                        : noop)
                                  : foreignPointerBigUint64ArrayProto)
                    : alwaysFalse
                function getTransferablePointer(originalTarget, foreignCallablePusher = foreignCallablePushTarget) {
                    let proxyPointer = proxyTargetToPointerMap.get(originalTarget)
                    if (proxyPointer) {
                        return proxyPointer
                    }
                    let distortionTarget
                    if (distortionCallback) {
                        distortionTarget = distortionCallback(originalTarget) // If a distortion entry is found, it must be a valid proxy target.
                        if (distortionTarget !== originalTarget && typeof distortionTarget !== typeof originalTarget) {
                            throw new TypeErrorCtor(`Invalid distortion ${toSafeTemplateStringValue(originalTarget)}.`)
                        }
                    } else {
                        distortionTarget = originalTarget
                    }
                    let isPossiblyRevoked = true
                    let targetFunctionArity = 0
                    let targetFunctionName = ''
                    let targetTypedArrayLength = 0
                    let targetTraits = 16 /* TargetTraits.IsObject */
                    if (typeof distortionTarget === 'function') {
                        isPossiblyRevoked = false
                        targetFunctionArity = 0
                        targetTraits = 4 /* TargetTraits.IsFunction */
                        try {
                            // Detect arrow functions.
                            if (!('prototype' in distortionTarget)) {
                                targetTraits |= 8 /* TargetTraits.IsArrowFunction */
                            }
                            const safeLengthDesc = ReflectGetOwnPropertyDescriptor(originalTarget, 'length')
                            if (safeLengthDesc) {
                                ReflectSetPrototypeOf(safeLengthDesc, null)
                                const { value: safeLengthDescValue } = safeLengthDesc
                                if (typeof safeLengthDescValue === 'number') {
                                    targetFunctionArity = safeLengthDescValue
                                }
                            }
                            const safeNameDesc = false
                                ? ReflectGetOwnPropertyDescriptor(originalTarget, 'name')
                                : undefined
                            if (safeNameDesc);
                        } catch (_unused16) {
                            isPossiblyRevoked = true
                        }
                    } else if (ArrayBufferIsView(distortionTarget)) {
                        isPossiblyRevoked = false
                        targetTraits = 2 /* TargetTraits.IsArrayBufferView */
                        try {
                            targetTypedArrayLength = ReflectApply(TypedArrayProtoLengthGetter, distortionTarget, [])
                            targetTraits |= 32 /* TargetTraits.IsTypedArray */ // eslint-disable-next-line no-empty
                        } catch (_unused17) {
                            // Could be a DataView object or a revoked proxy.
                            isPossiblyRevoked = true
                        }
                    }
                    if (isPossiblyRevoked) {
                        try {
                            if (isArrayOrThrowForRevoked(distortionTarget)) {
                                targetTraits = 1 /* TargetTraits.IsArray */
                            }
                        } catch (_unused18) {
                            targetTraits = 64 /* TargetTraits.Revoked */
                        }
                    }
                    proxyPointer = foreignCallablePusher(
                        createPointer(distortionTarget),
                        targetTraits,
                        targetFunctionArity,
                        targetFunctionName,
                        targetTypedArrayLength,
                    ) // The WeakMap is populated with the original target rather then the
                    // distorted one while the pointer always uses the distorted one.
                    // TODO: This mechanism poses another issue, which is that the return
                    // value of selectedTarget! can never be used to call across the
                    // membrane because that will cause a wrapping around the potential
                    // distorted value instead of the original value. This is not fatal,
                    // but implies that for every distorted value where are two proxies
                    // that are not ===, which is weird. Guaranteeing this is not easy
                    // because it means auditing the code.
                    proxyTargetToPointerMap.set(originalTarget, proxyPointer)
                    return proxyPointer
                }
                const installPropertyDescriptorMethodWrappers = IS_IN_SHADOW_REALM
                    ? (unforgeableGlobalThisKeys) => {
                          if (installedPropertyDescriptorMethodWrappersFlag) {
                              return
                          }
                          installedPropertyDescriptorMethodWrappersFlag = true // We wrap property descriptor methods to activate lazy
                          // descriptors and/or workaround browser bugs. The following
                          // methods are wrapped:
                          //   Object.getOwnPropertyDescriptors()
                          //   Object.getOwnPropertyDescriptor()
                          //   Reflect.defineProperty()
                          //   Reflect.getOwnPropertyDescriptor()
                          //   Object.prototype.__defineGetter__()
                          //   Object.prototype.__defineSetter__()
                          //   Object.prototype.__lookupGetter__()
                          //   Object.prototype.__lookupSetter__()
                          //
                          // Chromium based browsers have a bug that nulls the result
                          // of `window` getters in detached iframes when the property
                          // descriptor of `window.window` is retrieved.
                          // https://bugs.chromium.org/p/chromium/issues/detail?id=1305302
                          //
                          // Methods may be poisoned when they interact with the `window`
                          // object and retrieve property descriptors, like 'window',
                          // that contain the `window` object itself. The following
                          // built-in methods are susceptible to this issue:
                          //     console.log(window);
                          //     Object.getOwnPropertyDescriptors(window);
                          //     Object.getOwnPropertyDescriptor(window, 'window');
                          //     Reflect.getOwnPropertyDescriptor(window, 'window');
                          //     window.__lookupGetter__('window');
                          //     window.__lookupSetter__('window');
                          //
                          // We side step issues with `console` by mapping it to the
                          // primary realm's `console`. Since we're already wrapping
                          // property descriptor methods to activate lazy descriptors
                          // we use the wrapper to workaround the `window` getter
                          // nulling bug.
                          const shouldFixChromeBug =
                              isArrayOrThrowForRevoked(unforgeableGlobalThisKeys) &&
                              unforgeableGlobalThisKeys.length > 0 // Lazily populated by `getUnforgeableGlobalThisGetter()`;
                          const keyToGlobalThisGetterRegistry = shouldFixChromeBug
                              ? {
                                    __proto__: null,
                                }
                              : undefined
                          const getFixedDescriptor = shouldFixChromeBug
                              ? (target, key) =>
                                    ReflectApply(ArrayProtoIncludes, unforgeableGlobalThisKeys, [key])
                                        ? {
                                              configurable: false,
                                              enumerable: ReflectApply(ObjectProtoPropertyIsEnumerable, target, [key]),
                                              get: getUnforgeableGlobalThisGetter(key),
                                              set: undefined,
                                          }
                                        : ReflectGetOwnPropertyDescriptor(target, key)
                              : undefined
                          const getUnforgeableGlobalThisGetter = shouldFixChromeBug
                              ? (key) => {
                                    let globalThisGetter = keyToGlobalThisGetterRegistry[key]
                                    if (globalThisGetter === undefined) {
                                        // Wrap `unboundGlobalThisGetter` in bound function
                                        // to obscure the getter source as "[native code]".
                                        globalThisGetter = ReflectApply(FunctionProtoBind, unboundGlobalThisGetter, []) // Preserve identity continuity of getters.
                                        keyToGlobalThisGetterRegistry[key] = globalThisGetter
                                    }
                                    return globalThisGetter
                                }
                              : undefined
                          const lookupFixedGetter = shouldFixChromeBug
                              ? (target, key) =>
                                    ReflectApply(ArrayProtoIncludes, unforgeableGlobalThisKeys, [key])
                                        ? getUnforgeableGlobalThisGetter(key)
                                        : ReflectApply(ObjectProtoLookupGetter, target, [key])
                              : undefined
                          const lookupFixedSetter = shouldFixChromeBug
                              ? (target, key) =>
                                    ReflectApply(ArrayProtoIncludes, unforgeableGlobalThisKeys, [key])
                                        ? undefined
                                        : ReflectApply(ObjectProtoLookupSetter, target, [key])
                              : undefined
                          const unboundGlobalThisGetter = shouldFixChromeBug ? () => globalThisRef : undefined
                          const wrapDefineAccessOrProperty = (originalFunc) => {
                              const { length: originalFuncLength } = originalFunc // `__defineGetter__()` and `__defineSetter__()` have
                              // function lengths of 2 while `Reflect.defineProperty()`
                              // has a function length of 3.
                              const useThisArgAsTarget = originalFuncLength === 2
                              return new ProxyCtor(originalFunc, {
                                  apply(_originalFunc, thisArg, args) {
                                      if (args.length >= originalFuncLength) {
                                          const target = useThisArgAsTarget ? thisArg : args[0]
                                          if (
                                              (typeof target === 'object' && target !== null) ||
                                              typeof target === 'function'
                                          ) {
                                              const key = useThisArgAsTarget ? args[0] : args[1]
                                              const state = getLazyPropertyDescriptorStateByTarget(target)
                                              if (state != null && state[key]) {
                                                  // Activate the descriptor by triggering
                                                  // its getter.
                                                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                                  target[key]
                                              }
                                          }
                                      }
                                      return ReflectApply(originalFunc, thisArg, args)
                                  },
                              })
                          }
                          const wrapLookupAccessor = (originalFunc, lookupFixedAccessor) =>
                              new ProxyCtor(originalFunc, {
                                  apply(_originalFunc, thisArg, args) {
                                      if (
                                          args.length &&
                                          ((typeof thisArg === 'object' && thisArg !== null) ||
                                              typeof thisArg === 'function')
                                      ) {
                                          const { 0: key } = args
                                          const state = getLazyPropertyDescriptorStateByTarget(thisArg)
                                          if (state != null && state[key]) {
                                              // Activate the descriptor by triggering
                                              // its getter.
                                              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                              thisArg[key]
                                          }
                                          if (shouldFixChromeBug && thisArg === globalThisRef) {
                                              return lookupFixedAccessor(thisArg, key)
                                          }
                                      }
                                      return ReflectApply(originalFunc, thisArg, args)
                                  },
                              })
                          const wrapGetOwnPropertyDescriptor = (originalFunc) =>
                              new ProxyCtor(originalFunc, {
                                  apply(_originalFunc, thisArg, args) {
                                      if (args.length > 1) {
                                          const { 0: target, 1: key } = args
                                          if (
                                              (typeof target === 'object' && target !== null) ||
                                              typeof target === 'function'
                                          ) {
                                              const state = getLazyPropertyDescriptorStateByTarget(target)
                                              if (state != null && state[key]) {
                                                  // Activate the descriptor by triggering
                                                  // its getter.
                                                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                                  target[key]
                                              }
                                              if (shouldFixChromeBug && target === globalThisRef) {
                                                  return getFixedDescriptor(target, key)
                                              }
                                          }
                                      }
                                      return ReflectApply(originalFunc, thisArg, args)
                                  },
                              })
                          const wrapGetOwnPropertyDescriptors = (originalFunc) =>
                              new ProxyCtor(originalFunc, {
                                  apply(_originalFunc, thisArg, args) {
                                      const target = args.length ? args[0] : undefined
                                      if (
                                          !(
                                              (typeof target === 'object' && target !== null) ||
                                              typeof target === 'function'
                                          )
                                      ) {
                                          // Defer to native method to throw exception.
                                          return ReflectApply(originalFunc, thisArg, args)
                                      }
                                      const state = getLazyPropertyDescriptorStateByTarget(target)
                                      const isFixingChromeBug = target === globalThisRef && shouldFixChromeBug
                                      const unsafeDescMap = isFixingChromeBug // to populate with curated descriptors.
                                          ? {} // safe to use the native method.
                                          : ReflectApply(originalFunc, thisArg, args)
                                      if (!isFixingChromeBug && state === undefined) {
                                          // Exit early if the target is not a global
                                          // object and there are no lazy descriptors.
                                          return unsafeDescMap
                                      }
                                      const ownKeys = ReflectOwnKeys(isFixingChromeBug ? target : unsafeDescMap)
                                      for (let i = 0, { length } = ownKeys; i < length; i += 1) {
                                          const ownKey = ownKeys[i]
                                          const isLazyProp = !!(state != null && state[ownKey])
                                          if (isLazyProp) {
                                              // Activate the descriptor by triggering
                                              // its getter.
                                              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                              target[ownKey]
                                          }
                                          if (isLazyProp || isFixingChromeBug) {
                                              const unsafeDesc = isFixingChromeBug
                                                  ? getFixedDescriptor(target, ownKey)
                                                  : ReflectGetOwnPropertyDescriptor(target, ownKey) // Update the descriptor map entry.
                                              if (unsafeDesc) {
                                                  unsafeDescMap[ownKey] = unsafeDesc
                                              } else if (!isFixingChromeBug) {
                                                  ReflectDeleteProperty(unsafeDescMap, ownKey)
                                              }
                                          }
                                      }
                                      return unsafeDescMap
                                  },
                              })
                          try {
                              ReflectRef.defineProperty = wrapDefineAccessOrProperty(ReflectDefineProperty) // eslint-disable-next-line no-empty
                          } catch (_unused19) {}
                          try {
                              ReflectRef.getOwnPropertyDescriptor = wrapGetOwnPropertyDescriptor(
                                  ReflectGetOwnPropertyDescriptor,
                              ) // eslint-disable-next-line no-empty
                          } catch (_unused20) {}
                          try {
                              ObjectCtor.getOwnPropertyDescriptor =
                                  wrapGetOwnPropertyDescriptor(ObjectGetOwnPropertyDescriptor) // eslint-disable-next-line no-empty
                          } catch (_unused21) {}
                          try {
                              ObjectCtor.getOwnPropertyDescriptors = wrapGetOwnPropertyDescriptors(
                                  ObjectGetOwnPropertyDescriptors,
                              ) // eslint-disable-next-line no-empty
                          } catch (_unused22) {}
                          try {
                              // eslint-disable-next-line @typescript-eslint/naming-convention, no-restricted-properties, no-underscore-dangle
                              ObjectProto.__defineGetter__ = wrapDefineAccessOrProperty(ObjectProtoDefineGetter) // eslint-disable-next-line no-empty
                          } catch (_unused23) {}
                          try {
                              // eslint-disable-next-line @typescript-eslint/naming-convention, no-restricted-properties, no-underscore-dangle
                              ObjectProto.__defineSetter__ = wrapDefineAccessOrProperty(ObjectProtoDefineSetter) // eslint-disable-next-line no-empty
                          } catch (_unused24) {}
                          try {
                              // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
                              ObjectProto.__lookupGetter__ = wrapLookupAccessor(
                                  ObjectProtoLookupGetter,
                                  lookupFixedGetter,
                              ) // eslint-disable-next-line no-empty
                          } catch (_unused25) {}
                          try {
                              // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
                              ObjectProto.__lookupSetter__ = wrapLookupAccessor(
                                  ObjectProtoLookupSetter,
                                  lookupFixedSetter,
                              ) // eslint-disable-next-line no-empty
                          } catch (_unused26) {}
                      }
                    : noop
                function lookupForeignDescriptor(foreignTargetPointer, shadowTarget, key) {
                    let activity
                    if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                        activity = startActivity('lookupForeignDescriptor')
                    }
                    let protoPointerOrNull
                    let safeDesc
                    try {
                        protoPointerOrNull = foreignCallableBatchGetPrototypeOfWhenHasNoOwnPropertyDescriptor(
                            foreignTargetPointer,
                            key,
                            (
                                _key,
                                configurable,
                                enumerable,
                                writable,
                                valuePointerOrPrimitive,
                                getterPointerOrPrimitive,
                                setterPointerOrPrimitive,
                            ) => {
                                safeDesc = {
                                    __proto__: null,
                                    foreign: true,
                                }
                                if (configurable !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                                    safeDesc.configurable = configurable
                                }
                                if (enumerable !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                                    safeDesc.enumerable = enumerable
                                }
                                if (writable !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                                    safeDesc.writable = writable
                                }
                                if (getterPointerOrPrimitive !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                                    if (typeof getterPointerOrPrimitive === 'function') {
                                        getterPointerOrPrimitive()
                                        safeDesc.get = selectedTarget
                                        selectedTarget = undefined
                                    } else {
                                        safeDesc.get = undefined
                                    }
                                }
                                if (setterPointerOrPrimitive !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                                    if (typeof setterPointerOrPrimitive === 'function') {
                                        setterPointerOrPrimitive()
                                        safeDesc.set = selectedTarget
                                        selectedTarget = undefined
                                    } else {
                                        safeDesc.set = undefined
                                    }
                                }
                                if (valuePointerOrPrimitive !== LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                                    if (typeof valuePointerOrPrimitive === 'function') {
                                        valuePointerOrPrimitive()
                                        safeDesc.value = selectedTarget
                                        selectedTarget = undefined
                                    } else {
                                        safeDesc.value = valuePointerOrPrimitive
                                    }
                                }
                                if (configurable === false) {
                                    // Update the descriptor to non-configurable on
                                    // the shadow target.
                                    ReflectDefineProperty(shadowTarget, key, safeDesc)
                                }
                            },
                        )
                    } catch (error) {
                        var _selectedTarget10
                        const errorToThrow = (_selectedTarget10 = selectedTarget) != null ? _selectedTarget10 : error
                        selectedTarget = undefined
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.error(errorToThrow)
                        }
                        throw errorToThrow
                    }
                    if (safeDesc === undefined) {
                        // Avoiding calling the has trap for any proto chain operation,
                        // instead we implement the regular logic here in this trap.
                        let currentObject
                        if (typeof protoPointerOrNull === 'function') {
                            protoPointerOrNull()
                            currentObject = selectedTarget
                            selectedTarget = undefined
                        } else {
                            currentObject = null
                        }
                        while (currentObject) {
                            safeDesc = ReflectGetOwnPropertyDescriptor(currentObject, key)
                            if (safeDesc) {
                                ReflectSetPrototypeOf(safeDesc, null)
                                break
                            }
                            currentObject = ReflectGetPrototypeOf(currentObject)
                        }
                        if (safeDesc) {
                            var _ref3
                            const { get: getter, set: setter, value: localValue } = safeDesc
                            const possibleProxy =
                                (_ref3 = getter != null ? getter : setter) != null ? _ref3 : localValue
                            safeDesc.foreign =
                                ((typeof possibleProxy === 'object' && possibleProxy !== null) ||
                                    typeof possibleProxy === 'function') &&
                                proxyTargetToPointerMap.get(possibleProxy) !== undefined
                        }
                    }
                    if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                        activity.stop()
                    }
                    return safeDesc
                }
                function passthruForeignTraversedSet(foreignTargetPointer, shadowTarget, key, value, receiver) {
                    const safeDesc = lookupForeignDescriptor(foreignTargetPointer, shadowTarget, key) // Following the specification steps for
                    // OrdinarySetWithOwnDescriptor ( O, P, V, Receiver, ownDesc ).
                    // https://tc39.es/ecma262/#sec-ordinarysetwithowndescriptor
                    if (safeDesc) {
                        if ('get' in safeDesc || 'set' in safeDesc) {
                            const { set: setter } = safeDesc
                            if (setter) {
                                if (safeDesc.foreign) {
                                    foreignCallableApply(
                                        getTransferablePointer(setter),
                                        (typeof receiver === 'object' && receiver !== null) ||
                                            typeof receiver === 'function'
                                            ? getTransferablePointer(receiver) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                            : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                            typeof receiver === 'undefined'
                                            ? undefined
                                            : receiver,
                                        (typeof value === 'object' && value !== null) || typeof value === 'function'
                                            ? getTransferablePointer(value) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                            : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                            typeof value === 'undefined'
                                            ? undefined
                                            : value,
                                    )
                                } else {
                                    // Even though the setter function exists, we can't
                                    // use `ReflectSet()` because there might be a
                                    // distortion for that setter function, in which
                                    // case we must resolve the local setter and call
                                    // it instead.
                                    ReflectApply(setter, receiver, [value])
                                } // If there is a setter, it either throw or we can assume
                                // the value was set.
                                return true
                            }
                            return false
                        }
                        if (safeDesc.writable === false) {
                            return false
                        }
                    } // Exit early if receiver is not object like.
                    if (!((typeof receiver === 'object' && receiver !== null) || typeof receiver === 'function')) {
                        return false
                    }
                    const safeReceiverDesc = ReflectGetOwnPropertyDescriptor(receiver, key)
                    if (safeReceiverDesc) {
                        ReflectSetPrototypeOf(safeReceiverDesc, null) // Exit early for accessor descriptors or non-writable data
                        // descriptors.
                        if (
                            'get' in safeReceiverDesc ||
                            'set' in safeReceiverDesc ||
                            safeReceiverDesc.writable === false
                        ) {
                            return false
                        } // Setting the descriptor with only a value entry should not
                        // affect existing descriptor traits.
                        ReflectDefineProperty(receiver, key, {
                            __proto__: null,
                            value,
                        })
                        return true
                    } // `ReflectDefineProperty()` and `ReflectSet()` both are expected
                    // to return `false` when attempting to add a new property if the
                    // receiver is not extensible.
                    return ReflectDefineProperty(receiver, key, {
                        __proto__: null,
                        configurable: true,
                        enumerable: true,
                        value,
                        writable: true,
                    })
                }
                function pushErrorAcrossBoundary(error) {
                    if (LOCKER_DEBUGGABLE_FLAG) {
                        checkDebugMode()
                    } // Inline getTransferableValue().
                    if ((typeof error === 'object' && error !== null) || typeof error === 'function') {
                        const foreignErrorPointer = getTransferablePointer(error, foreignCallablePushErrorTarget)
                        foreignErrorPointer()
                    }
                    return error
                }
                function pushTarget(
                    foreignTargetPointer,
                    foreignTargetTraits,
                    foreignTargetFunctionArity,
                    foreignTargetFunctionName,
                    foreignTargetTypedArrayLength,
                ) {
                    const { proxy } = new BoundaryProxyHandler(
                        foreignTargetPointer,
                        foreignTargetTraits,
                        foreignTargetFunctionArity,
                        foreignTargetFunctionName,
                        foreignTargetTypedArrayLength,
                    )
                    proxyTargetToPointerMap.set(proxy, foreignTargetPointer)
                    return createPointer(proxy)
                }
                const setLazyPropertyDescriptorStateByTarget = IS_IN_SHADOW_REALM
                    ? (target, state) => {
                          localProxyTargetToLazyPropertyDescriptorStateMap.set(target, state)
                          foreignCallableSetLazyPropertyDescriptorStateByTarget(
                              getTransferablePointer(target),
                              getTransferablePointer(state),
                          )
                      }
                    : noop
                class BoundaryProxyHandler {
                    constructor(
                        foreignTargetPointer,
                        foreignTargetTraits,
                        foreignTargetFunctionArity,
                        foreignTargetFunctionName,
                        foreignTargetTypedArrayLength,
                    ) {
                        let shadowTarget
                        const isForeignTargetArray = foreignTargetTraits & 1 /* TargetTraits.IsArray */
                        const isForeignTargetFunction = foreignTargetTraits & 4 /* TargetTraits.IsFunction */
                        if (isForeignTargetFunction) {
                            // This shadow target is never invoked. It's needed to avoid
                            // proxy trap invariants. Because it's not invoked the code
                            // does not need to be instrumented for code coverage.
                            //
                            // istanbul ignore next
                            shadowTarget = foreignTargetTraits & 8 ? () => {} : function () {}
                        } else if (isForeignTargetArray) {
                            shadowTarget = []
                        } else {
                            shadowTarget = {}
                        }
                        const { proxy, revoke } = ProxyRevocable(shadowTarget, this)
                        __.attachDebuggerTarget?.(proxy, foreignTargetPointer)
                        this.foreignTargetPointer = foreignTargetPointer
                        this.foreignTargetTraits = foreignTargetTraits
                        this.foreignTargetTypedArrayLength = foreignTargetTypedArrayLength // Define in the BoundaryProxyHandler constructor so it is bound
                        // to the BoundaryProxyHandler instance.
                        this.nonConfigurableDescriptorCallback = (
                            key,
                            configurable,
                            enumerable,
                            writable,
                            valuePointer,
                            getterPointer,
                            setterPointer,
                        ) => {
                            // Update the descriptor to non-configurable on the shadow
                            // target.
                            ReflectDefineProperty(
                                this.shadowTarget,
                                key,
                                createDescriptorFromMeta(
                                    configurable,
                                    enumerable,
                                    writable,
                                    valuePointer,
                                    getterPointer,
                                    setterPointer,
                                ),
                            )
                        }
                        this.proxy = proxy
                        this.revoke = revoke
                        this.serializedValue = undefined
                        this.shadowTarget = shadowTarget
                        this.staticToStringTag = 'Object' // Define traps.
                        if (isForeignTargetFunction) {
                            var _arityToApplyTrapName, _arityToConstructTrap
                            this.apply =
                                this[
                                    (_arityToApplyTrapName =
                                        arityToApplyTrapNameRegistry[foreignTargetFunctionArity]) != null
                                        ? _arityToApplyTrapName
                                        : arityToApplyTrapNameRegistry.n
                                ]
                            this.construct =
                                this[
                                    (_arityToConstructTrap =
                                        arityToConstructTrapNameRegistry[foreignTargetFunctionArity]) != null
                                        ? _arityToConstructTrap
                                        : arityToConstructTrapNameRegistry.n
                                ]
                        }
                        this.defineProperty = BoundaryProxyHandler.defaultDefinePropertyTrap
                        this.deleteProperty = BoundaryProxyHandler.defaultDeletePropertyTrap
                        this.isExtensible = BoundaryProxyHandler.defaultIsExtensibleTrap
                        this.getOwnPropertyDescriptor = BoundaryProxyHandler.defaultGetOwnPropertyDescriptorTrap
                        this.getPrototypeOf = BoundaryProxyHandler.defaultGetPrototypeOfTrap
                        this.get =
                            foreignTargetTraits & 32
                                ? BoundaryProxyHandler.hybridGetTrapForTypedArray
                                : BoundaryProxyHandler.defaultGetTrap
                        this.has = BoundaryProxyHandler.defaultHasTrap
                        this.ownKeys = BoundaryProxyHandler.defaultOwnKeysTrap
                        this.preventExtensions = BoundaryProxyHandler.defaultPreventExtensionsTrap
                        this.setPrototypeOf = BoundaryProxyHandler.defaultSetPrototypeOfTrap
                        this.set = BoundaryProxyHandler.defaultSetTrap
                        if (foreignTargetTraits & 64) {
                            // Future optimization: Hoping proxies with frozen handlers
                            // can be faster.
                            ObjectFreeze(this)
                            this.revoke()
                        } else if (IS_IN_SHADOW_REALM) {
                            if (isForeignTargetArray || foreignTargetTraits & 2) {
                                this.makeProxyLive()
                            }
                        } else {
                            if (foreignTargetTraits & 16) {
                                // Lazily define serializedValue.
                                let cachedSerializedValue = LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                                const { serializedValue } = this
                                if (MINIFICATION_SAFE_SERIALIZED_VALUE_PROPERTY_NAME === undefined) {
                                    // A minification safe way to get the 'serializedValue'
                                    // property name.
                                    ;({ 0: MINIFICATION_SAFE_SERIALIZED_VALUE_PROPERTY_NAME } = ObjectKeys({
                                        serializedValue,
                                    }))
                                }
                                ReflectApply(ObjectProtoDefineGetter, this, [
                                    MINIFICATION_SAFE_SERIALIZED_VALUE_PROPERTY_NAME,
                                    () => {
                                        if (cachedSerializedValue === LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL) {
                                            cachedSerializedValue = foreignCallableSerializeTarget(
                                                this.foreignTargetPointer,
                                            )
                                        }
                                        return cachedSerializedValue
                                    },
                                ])
                            } // Future optimization: Hoping proxies with frozen handlers
                            // can be faster. If local mutations are not trapped, then
                            // freezing the handler is ok because it is not expecting to
                            // change in the future.
                            ObjectFreeze(this)
                        }
                    }
                    makeProxyLive() {
                        // Replace pending traps with live traps that can work with the
                        // target without taking snapshots.
                        this.deleteProperty = BoundaryProxyHandler.passthruDeletePropertyTrap
                        this.defineProperty = BoundaryProxyHandler.passthruDefinePropertyTrap
                        this.preventExtensions = BoundaryProxyHandler.passthruPreventExtensionsTrap
                        this.set = BoundaryProxyHandler.passthruSetTrap
                        this.setPrototypeOf = BoundaryProxyHandler.passthruSetPrototypeOfTrap // Future optimization: Hoping proxies with frozen handlers can
                        // be faster.
                        ObjectFreeze(this)
                    }
                    makeProxyStatic() {
                        // Reset all traps except apply and construct for static proxies
                        // since the proxy target is the shadow target and all operations
                        // are going to be applied to it rather than the real target.
                        this.defineProperty = BoundaryProxyHandler.staticDefinePropertyTrap
                        this.deleteProperty = BoundaryProxyHandler.staticDeletePropertyTrap
                        this.get = BoundaryProxyHandler.staticGetTrap
                        this.getOwnPropertyDescriptor = BoundaryProxyHandler.staticGetOwnPropertyDescriptorTrap
                        this.getPrototypeOf = BoundaryProxyHandler.staticGetPrototypeOfTrap
                        this.has = BoundaryProxyHandler.staticHasTrap
                        this.isExtensible = BoundaryProxyHandler.staticIsExtensibleTrap
                        this.ownKeys = BoundaryProxyHandler.staticOwnKeysTrap
                        this.preventExtensions = BoundaryProxyHandler.staticPreventExtensionsTrap
                        this.set = BoundaryProxyHandler.staticSetTrap
                        this.setPrototypeOf = BoundaryProxyHandler.staticSetPrototypeOfTrap
                        const {
                            foreignTargetPointer: foreignTargetPointer1,
                            foreignTargetTraits: foreignTargetTraits1,
                            shadowTarget: shadowTarget1,
                        } = this
                        if (useFastForeignTargetPath) {
                            fastForeignTargetPointers.delete(foreignTargetPointer1)
                        } // We don't wrap `foreignCallableGetTargetIntegrityTraits()`
                        // in a try-catch because it cannot throw.
                        const targetIntegrityTraits = foreignCallableGetTargetIntegrityTraits(foreignTargetPointer1)
                        if (targetIntegrityTraits & 8) {
                            // Future optimization: Hoping proxies with frozen
                            // handlers can be faster.
                            ObjectFreeze(this) // the target is a revoked proxy, in which case we revoke
                            // this proxy as well.
                            this.revoke()
                            return
                        } // A proxy can revoke itself when traps are triggered and break
                        // the membrane, therefore we need protection.
                        try {
                            copyForeignOwnPropertyDescriptorsAndPrototypeToShadowTarget(
                                foreignTargetPointer1,
                                shadowTarget1,
                            )
                        } catch (_unused27) {
                            // We don't wrap `foreignCallableIsTargetRevoked()` in a
                            // try-catch because it cannot throw.
                            if (foreignCallableIsTargetRevoked(foreignTargetPointer1)) {
                                // Future optimization: Hoping proxies with frozen
                                // handlers can be faster.
                                ObjectFreeze(this)
                                this.revoke()
                                return
                            }
                        }
                        if (foreignTargetTraits1 & 16 && !(SymbolToStringTag in shadowTarget1)) {
                            let toStringTag = 'Object'
                            try {
                                toStringTag = foreignCallableGetToStringTagOfTarget(foreignTargetPointer1) // eslint-disable-next-line no-empty
                            } catch (_unused28) {}
                            this.staticToStringTag = toStringTag
                        } // Preserve the semantics of the target.
                        if (targetIntegrityTraits & 4) {
                            ObjectFreeze(shadowTarget1)
                        } else {
                            if (targetIntegrityTraits & 2) {
                                ObjectSeal(shadowTarget1)
                            } else if (targetIntegrityTraits & 1) {
                                ReflectPreventExtensions(shadowTarget1)
                            }
                            if (LOCKER_UNMINIFIED_FLAG) {
                                // We don't wrap `foreignCallableDebugInfo()` in a try-catch
                                // because it cannot throw.
                                foreignCallableDebugInfo(
                                    'Mutations on the membrane of an object originating ' +
                                        'outside of the sandbox will not be reflected on ' +
                                        'the object itself:',
                                    foreignTargetPointer1,
                                )
                            }
                        } // Future optimization: Hoping proxies with frozen handlers can
                        // be faster.
                        ObjectFreeze(this)
                    }
                    static passthruDefinePropertyTrap(_shadowTarget, key, unsafePartialDesc) {
                        lastProxyTrapCalled = 4 /* ProxyHandlerTraps.DefineProperty */
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity('Reflect.defineProperty')
                        }
                        const { foreignTargetPointer: foreignTargetPointer1, nonConfigurableDescriptorCallback } = this
                        const safePartialDesc = unsafePartialDesc
                        ReflectSetPrototypeOf(safePartialDesc, null)
                        const { get: getter, set: setter, value: value1 } = safePartialDesc
                        const valuePointerOrPrimitive =
                            'value' in safePartialDesc
                                ? (typeof value1 === 'object' && value1 !== null) || typeof value1 === 'function'
                                    ? getTransferablePointer(value1) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                    : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                    typeof value1 === 'undefined'
                                    ? undefined
                                    : value1
                                : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                        const getterPointerOrUndefinedSymbol =
                            'get' in safePartialDesc
                                ? typeof getter === 'function'
                                    ? getTransferablePointer(getter)
                                    : getter
                                : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                        const setterPointerOrUndefinedSymbol =
                            'set' in safePartialDesc
                                ? typeof setter === 'function'
                                    ? getTransferablePointer(setter)
                                    : setter
                                : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                        let result = false
                        try {
                            result = foreignCallableDefineProperty(
                                foreignTargetPointer1,
                                key,
                                'configurable' in safePartialDesc
                                    ? !!safePartialDesc.configurable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'enumerable' in safePartialDesc
                                    ? !!safePartialDesc.enumerable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'writable' in safePartialDesc
                                    ? !!safePartialDesc.writable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                valuePointerOrPrimitive,
                                getterPointerOrUndefinedSymbol,
                                setterPointerOrUndefinedSymbol,
                                nonConfigurableDescriptorCallback,
                            )
                        } catch (error) {
                            var _selectedTarget11
                            const errorToThrow =
                                (_selectedTarget11 = selectedTarget) != null ? _selectedTarget11 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        if (
                            useFastForeignTargetPath &&
                            result &&
                            (typeof getterPointerOrUndefinedSymbol === 'function' ||
                                typeof setterPointerOrUndefinedSymbol === 'function')
                        ) {
                            fastForeignTargetPointers.delete(foreignTargetPointer1)
                        }
                        return result
                    }
                    static passthruDeletePropertyTrap(_shadowTarget, key) {
                        lastProxyTrapCalled = 8 /* ProxyHandlerTraps.DeleteProperty */
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity('Reflect.deleteProperty')
                        }
                        let result = false
                        try {
                            result = foreignCallableDeleteProperty(this.foreignTargetPointer, key)
                        } catch (error) {
                            var _selectedTarget12
                            const errorToThrow =
                                (_selectedTarget12 = selectedTarget) != null ? _selectedTarget12 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                    static passthruGetPrototypeOfTrap(_shadowTarget) {
                        lastProxyTrapCalled = 64 /* ProxyHandlerTraps.GetPrototypeOf */
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity('Reflect.getPrototypeOf')
                        }
                        let protoPointerOrNull
                        try {
                            protoPointerOrNull = foreignCallableGetPrototypeOf(this.foreignTargetPointer)
                        } catch (error) {
                            var _selectedTarget13
                            const errorToThrow =
                                (_selectedTarget13 = selectedTarget) != null ? _selectedTarget13 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        let proto
                        if (typeof protoPointerOrNull === 'function') {
                            protoPointerOrNull()
                            proto = selectedTarget
                            selectedTarget = undefined
                        } else {
                            proto = null
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return proto
                    }
                    static passthruIsExtensibleTrap(_shadowTarget) {
                        lastProxyTrapCalled = 256 /* ProxyHandlerTraps.IsExtensible */
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity('Reflect.isExtensible')
                        }
                        const { shadowTarget: shadowTarget1 } = this
                        let result = false // Check if already locked.
                        if (ReflectIsExtensible(shadowTarget1)) {
                            const { foreignTargetPointer: foreignTargetPointer1 } = this
                            try {
                                result = foreignCallableIsExtensible(foreignTargetPointer1)
                            } catch (error) {
                                var _selectedTarget14
                                const errorToThrow =
                                    (_selectedTarget14 = selectedTarget) != null ? _selectedTarget14 : error
                                selectedTarget = undefined
                                if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                    activity.error(errorToThrow)
                                }
                                throw errorToThrow
                            }
                            if (!result) {
                                copyForeignOwnPropertyDescriptorsAndPrototypeToShadowTarget(
                                    foreignTargetPointer1,
                                    shadowTarget1,
                                )
                                ReflectPreventExtensions(shadowTarget1)
                            }
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                    static passthruOwnKeysTrap(_shadowTarget) {
                        lastProxyTrapCalled = 512 /* ProxyHandlerTraps.OwnKeys */
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity('Reflect.ownKeys')
                        }
                        let ownKeys
                        try {
                            foreignCallableOwnKeys(this.foreignTargetPointer, (...args) => {
                                ownKeys = args
                            })
                        } catch (error) {
                            var _selectedTarget15
                            const errorToThrow =
                                (_selectedTarget15 = selectedTarget) != null ? _selectedTarget15 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return ownKeys || []
                    }
                    static passthruGetOwnPropertyDescriptorTrap(_shadowTarget, key) {
                        lastProxyTrapCalled = 32 /* ProxyHandlerTraps.GetOwnPropertyDescriptor */
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity('Reflect.getOwnPropertyDescriptor')
                        }
                        const { foreignTargetPointer: foreignTargetPointer1, shadowTarget: shadowTarget1 } = this
                        let safeDesc
                        try {
                            foreignCallableGetOwnPropertyDescriptor(
                                foreignTargetPointer1,
                                key,
                                (
                                    _key,
                                    configurable,
                                    enumerable,
                                    writable,
                                    valuePointer,
                                    getterPointer,
                                    setterPointer,
                                ) => {
                                    safeDesc = createDescriptorFromMeta(
                                        configurable,
                                        enumerable,
                                        writable,
                                        valuePointer,
                                        getterPointer,
                                        setterPointer,
                                    )
                                    if (safeDesc.configurable === false) {
                                        // Update the descriptor to non-configurable on
                                        // the shadow target.
                                        ReflectDefineProperty(shadowTarget1, key, safeDesc)
                                    }
                                },
                            )
                        } catch (error) {
                            var _selectedTarget16
                            const errorToThrow =
                                (_selectedTarget16 = selectedTarget) != null ? _selectedTarget16 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return safeDesc
                    }
                    static passthruPreventExtensionsTrap(_shadowTarget) {
                        lastProxyTrapCalled = 1024 /* ProxyHandlerTraps.PreventExtensions */
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity('Reflect.preventExtensions')
                        }
                        const { foreignTargetPointer: foreignTargetPointer1, shadowTarget: shadowTarget1 } = this
                        let result = true
                        if (ReflectIsExtensible(shadowTarget1)) {
                            let resultEnum = 0 /* PreventExtensionsResult.None */
                            try {
                                resultEnum = foreignCallablePreventExtensions(foreignTargetPointer1)
                            } catch (error) {
                                var _selectedTarget17
                                const errorToThrow =
                                    (_selectedTarget17 = selectedTarget) != null ? _selectedTarget17 : error
                                selectedTarget = undefined
                                if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                    activity.error(errorToThrow)
                                }
                                throw errorToThrow
                            } // If the target is a proxy it might reject the
                            // preventExtension call, in which case we should not
                            // attempt to lock down the shadow target.
                            if (!(resultEnum & 1)) {
                                copyForeignOwnPropertyDescriptorsAndPrototypeToShadowTarget(
                                    foreignTargetPointer1,
                                    shadowTarget1,
                                )
                                ReflectPreventExtensions(shadowTarget1)
                            }
                            result = !(resultEnum & 2)
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                    static passthruSetPrototypeOfTrap(_shadowTarget, proto) {
                        lastProxyTrapCalled = 4096 /* ProxyHandlerTraps.SetPrototypeOf */
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity('Reflect.setPrototypeOf')
                        }
                        const { foreignTargetPointer: foreignTargetPointer1 } = this
                        const transferableProto = proto ? getTransferablePointer(proto) : proto
                        let result = false
                        try {
                            result = foreignCallableSetPrototypeOf(foreignTargetPointer1, transferableProto)
                        } catch (error) {
                            var _selectedTarget18
                            const errorToThrow =
                                (_selectedTarget18 = selectedTarget) != null ? _selectedTarget18 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        if (useFastForeignTargetPath && result) {
                            fastForeignTargetPointers.delete(foreignTargetPointer1)
                        }
                        return result
                    }
                    static passthruSetTrap(_shadowTarget, key, value, receiver) {
                        lastProxyTrapCalled = 2048 /* ProxyHandlerTraps.Set */
                        const { foreignTargetPointer: foreignTargetPointer1, proxy, shadowTarget: shadowTarget1 } = this // Intentionally ignoring `document.all`.
                        // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                        // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                        if (typeof value === 'undefined') {
                            value = undefined
                        }
                        if (typeof receiver === 'undefined') {
                            receiver = proxy
                        }
                        const isFastPath = proxy === receiver
                        let activity
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity = startActivity(isFastPath ? 'Reflect.set' : 'passthruForeignTraversedSet')
                        }
                        let result = false
                        try {
                            result = isFastPath
                                ? foreignCallableSet(
                                      foreignTargetPointer1,
                                      key,
                                      (typeof value === 'object' && value !== null) || typeof value === 'function'
                                          ? getTransferablePointer(value)
                                          : value,
                                      LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                  )
                                : passthruForeignTraversedSet(
                                      foreignTargetPointer1,
                                      shadowTarget1,
                                      key,
                                      value,
                                      receiver,
                                  )
                        } catch (error) {
                            var _selectedTarget19
                            const errorToThrow =
                                (_selectedTarget19 = selectedTarget) != null ? _selectedTarget19 : error
                            selectedTarget = undefined
                            if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                activity.error(errorToThrow)
                            }
                            throw errorToThrow
                        }
                        if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                            activity.stop()
                        }
                        return result
                    }
                } // Logic implementation of all traps.
                // Hybrid traps:
                // (traps that operate on their shadowTarget, proxy, and foreignTargetPointer):
                BoundaryProxyHandler.hybridGetTrap = IS_IN_SHADOW_REALM
                    ? function (_shadowTarget, key, receiver) {
                          let activity
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity = startActivity('hybridGetTrap')
                          }
                          const {
                              foreignTargetPointer: foreignTargetPointer1,
                              foreignTargetTraits: foreignTargetTraits1,
                              proxy,
                              shadowTarget: shadowTarget1,
                          } = this
                          let safeDesc
                          let result
                          if (useFastForeignTargetPath && fastForeignTargetPointers.has(foreignTargetPointer1)) {
                              let pointerOrPrimitive
                              try {
                                  pointerOrPrimitive = foreignCallableGetPropertyValue(foreignTargetPointer1, key)
                              } catch (error) {
                                  var _selectedTarget20
                                  const errorToThrow =
                                      (_selectedTarget20 = selectedTarget) != null ? _selectedTarget20 : error
                                  selectedTarget = undefined
                                  if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                      activity.error(errorToThrow)
                                  }
                                  throw errorToThrow
                              }
                              if (typeof pointerOrPrimitive === 'function') {
                                  pointerOrPrimitive()
                                  result = selectedTarget
                                  selectedTarget = undefined
                              } else {
                                  result = pointerOrPrimitive
                              }
                          } else {
                              safeDesc = lookupForeignDescriptor(foreignTargetPointer1, shadowTarget1, key)
                              if (safeDesc) {
                                  const { get: getter, value: localValue } = safeDesc
                                  if (getter) {
                                      if (safeDesc.foreign) {
                                          const foreignGetterPointer = getTransferablePointer(getter)
                                          const transferableReceiver =
                                              proxy === receiver
                                                  ? foreignTargetPointer1
                                                  : (typeof receiver === 'object' && receiver !== null) ||
                                                    typeof receiver === 'function'
                                                  ? getTransferablePointer(receiver)
                                                  : receiver
                                          let pointerOrPrimitive
                                          try {
                                              pointerOrPrimitive = foreignCallableApply(
                                                  foreignGetterPointer,
                                                  transferableReceiver,
                                              )
                                          } catch (error) {
                                              var _selectedTarget21
                                              const errorToThrow =
                                                  (_selectedTarget21 = selectedTarget) != null
                                                      ? _selectedTarget21
                                                      : error
                                              selectedTarget = undefined
                                              if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                                  activity.error(errorToThrow)
                                              }
                                              throw errorToThrow
                                          }
                                          if (typeof pointerOrPrimitive === 'function') {
                                              pointerOrPrimitive()
                                              result = selectedTarget
                                              selectedTarget = undefined
                                          } else {
                                              result = pointerOrPrimitive
                                          }
                                      } else {
                                          // Even though the getter function exists,
                                          // we can't use `ReflectGet()` because there
                                          // might be a distortion for that getter function,
                                          // in which case we must resolve the local getter
                                          // and call it instead.
                                          result = ReflectApply(getter, receiver, [])
                                      }
                                  } else {
                                      result = localValue
                                  }
                              } else {
                                  const transferableReceiver =
                                      proxy === receiver
                                          ? foreignTargetPointer1
                                          : (typeof receiver === 'object' && receiver !== null) ||
                                            typeof receiver === 'function'
                                          ? getTransferablePointer(receiver)
                                          : receiver
                                  let pointerOrPrimitive
                                  try {
                                      pointerOrPrimitive = foreignCallableGet(
                                          foreignTargetPointer1,
                                          foreignTargetTraits1,
                                          key,
                                          transferableReceiver,
                                      )
                                  } catch (error) {
                                      var _selectedTarget22
                                      const errorToThrow =
                                          (_selectedTarget22 = selectedTarget) != null ? _selectedTarget22 : error
                                      selectedTarget = undefined
                                      if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                          activity.error(errorToThrow)
                                      }
                                      throw errorToThrow
                                  }
                                  if (typeof pointerOrPrimitive === 'function') {
                                      pointerOrPrimitive()
                                      result = selectedTarget
                                      selectedTarget = undefined
                                  } else {
                                      result = pointerOrPrimitive
                                  }
                              }
                          }
                          if (
                              safeDesc === undefined &&
                              result === undefined &&
                              key === SymbolToStringTag &&
                              foreignTargetTraits1 & 16
                          ) {
                              let toStringTag
                              try {
                                  toStringTag = foreignCallableGetToStringTagOfTarget(foreignTargetPointer1)
                              } catch (error) {
                                  var _selectedTarget23
                                  const errorToThrow =
                                      (_selectedTarget23 = selectedTarget) != null ? _selectedTarget23 : error
                                  selectedTarget = undefined
                                  if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                      activity.error(errorToThrow)
                                  }
                                  throw errorToThrow
                              } // The default language toStringTag is "Object". If we
                              // receive "Object" we return `undefined` to let the
                              // language resolve it naturally without projecting a
                              // value.
                              if (toStringTag !== 'Object') {
                                  result = toStringTag
                              }
                          }
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity.stop()
                          }
                          return result
                      }
                    : noop
                BoundaryProxyHandler.hybridGetTrapForTypedArray = IS_IN_SHADOW_REALM
                    ? function (_shadowTarget, key, receiver) {
                          let activity
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity = startActivity('hybridGetTrapForTypedArray')
                          }
                          const {
                              foreignTargetPointer: foreignTargetPointer1,
                              foreignTargetTypedArrayLength: foreignTargetTypedArrayLength1,
                              proxy,
                              shadowTarget: shadowTarget1,
                          } = this
                          let useFastPath = useFastForeignTargetPathForTypedArrays
                          if (!useFastPath && typeof key === 'string') {
                              const possibleIndex = +key
                              useFastPath =
                                  possibleIndex > -1 &&
                                  possibleIndex < foreignTargetTypedArrayLength1 &&
                                  NumberIsInteger(possibleIndex)
                          }
                          let result
                          if (useFastPath) {
                              try {
                                  result = foreignCallableGetPropertyValue(foreignTargetPointer1, key)
                              } catch (error) {
                                  var _selectedTarget24
                                  const errorToThrow =
                                      (_selectedTarget24 = selectedTarget) != null ? _selectedTarget24 : error
                                  selectedTarget = undefined
                                  if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                      activity.error(errorToThrow)
                                  }
                                  throw errorToThrow
                              }
                          } else {
                              const safeDesc = lookupForeignDescriptor(foreignTargetPointer1, shadowTarget1, key)
                              if (safeDesc) {
                                  const { get: getter, value: localValue } = safeDesc
                                  if (getter) {
                                      if (safeDesc.foreign) {
                                          const foreignGetterPointer = getTransferablePointer(getter)
                                          const transferableReceiver =
                                              proxy === receiver
                                                  ? foreignTargetPointer1
                                                  : (typeof receiver === 'object' && receiver !== null) ||
                                                    typeof receiver === 'function'
                                                  ? getTransferablePointer(receiver)
                                                  : receiver
                                          let pointerOrPrimitive
                                          try {
                                              pointerOrPrimitive = foreignCallableApply(
                                                  foreignGetterPointer,
                                                  transferableReceiver,
                                              )
                                          } catch (error) {
                                              var _selectedTarget25
                                              const errorToThrow =
                                                  (_selectedTarget25 = selectedTarget) != null
                                                      ? _selectedTarget25
                                                      : error
                                              selectedTarget = undefined
                                              if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                                  activity.error(errorToThrow)
                                              }
                                              throw errorToThrow
                                          }
                                          if (typeof pointerOrPrimitive === 'function') {
                                              pointerOrPrimitive()
                                              result = selectedTarget
                                              selectedTarget = undefined
                                          } else {
                                              result = pointerOrPrimitive
                                          }
                                      } else {
                                          // Even though the getter function exists,
                                          // we can't use `ReflectGet()` because there
                                          // might be a distortion for that getter function,
                                          // in which case we must resolve the local getter
                                          // and call it instead.
                                          result = ReflectApply(getter, receiver, [])
                                      }
                                  } else {
                                      result = localValue
                                  }
                              }
                          }
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity.stop()
                          }
                          return result
                      }
                    : noop
                BoundaryProxyHandler.hybridHasTrap = IS_IN_SHADOW_REALM
                    ? function (_shadowTarget, key) {
                          let activity
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity = startActivity('hybridHasTrap')
                          }
                          let trueOrProtoPointerOrNull
                          try {
                              trueOrProtoPointerOrNull = foreignCallableBatchGetPrototypeOfWhenHasNoOwnProperty(
                                  this.foreignTargetPointer,
                                  key,
                              )
                          } catch (error) {
                              var _selectedTarget26
                              const errorToThrow =
                                  (_selectedTarget26 = selectedTarget) != null ? _selectedTarget26 : error
                              selectedTarget = undefined
                              if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                  activity.error(errorToThrow)
                              }
                              throw errorToThrow
                          }
                          let result = false
                          if (trueOrProtoPointerOrNull === true) {
                              result = true
                          } else {
                              // Avoiding calling the has trap for any proto chain operation,
                              // instead we implement the regular logic here in this trap.
                              let currentObject
                              if (typeof trueOrProtoPointerOrNull === 'function') {
                                  trueOrProtoPointerOrNull()
                                  currentObject = selectedTarget
                                  selectedTarget = undefined
                              } else {
                                  currentObject = null
                              }
                              while (currentObject) {
                                  if (ObjectHasOwn(currentObject, key)) {
                                      result = true
                                      break
                                  }
                                  currentObject = ReflectGetPrototypeOf(currentObject)
                              }
                          }
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity.stop()
                          }
                          return result
                      }
                    : alwaysFalse
                BoundaryProxyHandler.passthruGetTrap = !IS_IN_SHADOW_REALM
                    ? function (_shadowTarget, key, receiver) {
                          // Only allow accessing near-membrane symbol values if the
                          // BoundaryProxyHandler.has trap has been called immediately
                          // before and the symbol does not exist.
                          nearMembraneSymbolFlag && (nearMembraneSymbolFlag = lastProxyTrapCalled === 128)
                          lastProxyTrapCalled = 16 /* ProxyHandlerTraps.Get */
                          if (nearMembraneSymbolFlag) {
                              // Exit without performing a [[Get]] for near-membrane
                              // symbols because we know when the nearMembraneSymbolFlag
                              // is on that there is no shadowed symbol value.
                              if (key === LOCKER_NEAR_MEMBRANE_SYMBOL) {
                                  return true
                              }
                              if (key === LOCKER_NEAR_MEMBRANE_SERIALIZED_VALUE_SYMBOL) {
                                  return this.serializedValue
                              }
                          }
                          let activity
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity = startActivity('Reflect.get')
                          }
                          const {
                              foreignTargetPointer: foreignTargetPointer1,
                              foreignTargetTraits: foreignTargetTraits1,
                              proxy,
                          } = this
                          if (typeof receiver === 'undefined') {
                              receiver = proxy
                          }
                          const transferableReceiver =
                              proxy === receiver
                                  ? LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                                  : (typeof receiver === 'object' && receiver !== null) ||
                                    typeof receiver === 'function'
                                  ? getTransferablePointer(receiver)
                                  : receiver
                          let pointerOrPrimitive
                          try {
                              pointerOrPrimitive = foreignCallableGet(
                                  foreignTargetPointer1,
                                  foreignTargetTraits1,
                                  key,
                                  transferableReceiver,
                              )
                          } catch (error) {
                              var _selectedTarget27
                              const errorToThrow =
                                  (_selectedTarget27 = selectedTarget) != null ? _selectedTarget27 : error
                              selectedTarget = undefined
                              if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                  activity.error(errorToThrow)
                              }
                              throw errorToThrow
                          }
                          let result
                          if (typeof pointerOrPrimitive === 'function') {
                              pointerOrPrimitive()
                              result = selectedTarget
                              selectedTarget = undefined
                          } else {
                              result = pointerOrPrimitive
                          }
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity.stop()
                          }
                          return result
                      }
                    : noop
                BoundaryProxyHandler.passthruHasTrap = !IS_IN_SHADOW_REALM
                    ? function (_shadowTarget, key) {
                          lastProxyTrapCalled = 128 /* ProxyHandlerTraps.Has */
                          let activity
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity = startActivity('Reflect.has')
                          }
                          let result
                          try {
                              result = foreignCallableHas(this.foreignTargetPointer, key)
                          } catch (error) {
                              var _selectedTarget28
                              const errorToThrow =
                                  (_selectedTarget28 = selectedTarget) != null ? _selectedTarget28 : error
                              selectedTarget = undefined
                              if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                                  activity.error(errorToThrow)
                              }
                              throw errorToThrow
                          } // The near-membrane symbol flag is on if the symbol does not
                          // exist on the object or its [[Prototype]].
                          nearMembraneSymbolFlag =
                              !result &&
                              (key === LOCKER_NEAR_MEMBRANE_SYMBOL ||
                                  key === LOCKER_NEAR_MEMBRANE_SERIALIZED_VALUE_SYMBOL)
                          if (LOCKER_DEBUG_MODE_INSTRUMENTATION_FLAG) {
                              activity.stop()
                          }
                          return result
                      }
                    : alwaysFalse // Pending traps:
                BoundaryProxyHandler.pendingDefinePropertyTrap = IS_IN_SHADOW_REALM
                    ? function (shadowTarget, key, unsafePartialDesc) {
                          const {
                              foreignTargetPointer: foreignTargetPointer1,
                              foreignTargetTraits: foreignTargetTraits1,
                          } = this // We don't wrap `foreignCallableIsTargetLive()` in a
                          // try-catch because it cannot throw.
                          if (foreignCallableIsTargetLive(foreignTargetPointer1, foreignTargetTraits1)) {
                              this.makeProxyLive()
                          } else {
                              if (useFastForeignTargetPath) {
                                  if (isForeignPointerOfObjectProto(foreignTargetPointer1)) {
                                      disableFastForeignTargetPointers()
                                  } else if (isForeignPointerOfTypedArrayProto(foreignTargetPointer1)) {
                                      useFastForeignTargetPathForTypedArrays = false
                                  }
                              }
                              this.makeProxyStatic()
                          }
                          return this.defineProperty(shadowTarget, key, unsafePartialDesc)
                      }
                    : alwaysFalse
                BoundaryProxyHandler.pendingDeletePropertyTrap = IS_IN_SHADOW_REALM
                    ? function (shadowTarget, key) {
                          // We don't wrap `foreignCallableIsTargetLive()` in a
                          // try-catch because it cannot throw.
                          if (foreignCallableIsTargetLive(this.foreignTargetPointer, this.foreignTargetTraits)) {
                              this.makeProxyLive()
                          } else {
                              this.makeProxyStatic()
                          }
                          return this.deleteProperty(shadowTarget, key)
                      }
                    : alwaysFalse
                BoundaryProxyHandler.pendingPreventExtensionsTrap = IS_IN_SHADOW_REALM
                    ? function (shadowTarget) {
                          // We don't wrap `foreignCallableIsTargetLive()` in a
                          // try-catch because it cannot throw.
                          if (foreignCallableIsTargetLive(this.foreignTargetPointer, this.foreignTargetTraits)) {
                              this.makeProxyLive()
                          } else {
                              this.makeProxyStatic()
                          }
                          return this.preventExtensions(shadowTarget)
                      }
                    : alwaysFalse
                BoundaryProxyHandler.pendingSetPrototypeOfTrap = IS_IN_SHADOW_REALM
                    ? function (shadowTarget, proto) {
                          const {
                              foreignTargetPointer: foreignTargetPointer1,
                              foreignTargetTraits: foreignTargetTraits1,
                          } = this // We don't wrap `foreignCallableIsTargetLive()` in a
                          // try-catch because it cannot throw.
                          if (foreignCallableIsTargetLive(foreignTargetPointer1, foreignTargetTraits1)) {
                              this.makeProxyLive()
                          } else {
                              if (useFastForeignTargetPath) {
                                  if (isForeignPointerOfObjectProto(foreignTargetPointer1)) {
                                      disableFastForeignTargetPointers()
                                  } else if (isForeignPointerOfTypedArrayProto(foreignTargetPointer1)) {
                                      useFastForeignTargetPathForTypedArrays = false
                                  }
                              }
                              this.makeProxyStatic()
                          }
                          return this.setPrototypeOf(shadowTarget, proto)
                      }
                    : alwaysFalse
                BoundaryProxyHandler.pendingSetTrap = IS_IN_SHADOW_REALM
                    ? function (shadowTarget, key, value, receiver) {
                          const {
                              foreignTargetPointer: foreignTargetPointer1,
                              foreignTargetTraits: foreignTargetTraits1,
                          } = this // We don't wrap `foreignCallableIsTargetLive()` in a
                          // try-catch because it cannot throw.
                          if (foreignCallableIsTargetLive(foreignTargetPointer1, foreignTargetTraits1)) {
                              this.makeProxyLive()
                          } else {
                              if (useFastForeignTargetPath) {
                                  if (isForeignPointerOfObjectProto(foreignTargetPointer1)) {
                                      disableFastForeignTargetPointers()
                                  } else if (isForeignPointerOfTypedArrayProto(foreignTargetPointer1)) {
                                      useFastForeignTargetPathForTypedArrays = false
                                  }
                              }
                              this.makeProxyStatic()
                          }
                          return this.set(shadowTarget, key, value, receiver)
                      }
                    : alwaysFalse //  Static traps:
                BoundaryProxyHandler.staticDefinePropertyTrap = IS_IN_SHADOW_REALM ? ReflectDefineProperty : alwaysFalse
                BoundaryProxyHandler.staticDeletePropertyTrap = IS_IN_SHADOW_REALM ? ReflectDeleteProperty : alwaysFalse
                BoundaryProxyHandler.staticGetOwnPropertyDescriptorTrap = IS_IN_SHADOW_REALM
                    ? ReflectGetOwnPropertyDescriptor
                    : noop
                BoundaryProxyHandler.staticGetPrototypeOfTrap = IS_IN_SHADOW_REALM ? ReflectGetPrototypeOf : () => null
                BoundaryProxyHandler.staticGetTrap = IS_IN_SHADOW_REALM
                    ? function (shadowTarget, key, receiver) {
                          const { foreignTargetTraits: foreignTargetTraits1, staticToStringTag } = this
                          const result = ReflectGet(shadowTarget, key, receiver)
                          if (
                              result === undefined &&
                              key === SymbolToStringTag &&
                              foreignTargetTraits1 & 16 && // The default language toStringTag is "Object". If we
                              // receive "Object" we return `undefined` to let the
                              // language resolve it naturally without projecting a
                              // value.
                              staticToStringTag !== 'Object' &&
                              !(key in shadowTarget)
                          ) {
                              return staticToStringTag
                          }
                          return result
                      }
                    : noop
                BoundaryProxyHandler.staticHasTrap = IS_IN_SHADOW_REALM ? ReflectHas : alwaysFalse
                BoundaryProxyHandler.staticIsExtensibleTrap = IS_IN_SHADOW_REALM ? ReflectIsExtensible : alwaysFalse
                BoundaryProxyHandler.staticOwnKeysTrap = IS_IN_SHADOW_REALM ? ReflectOwnKeys : () => []
                BoundaryProxyHandler.staticPreventExtensionsTrap = IS_IN_SHADOW_REALM
                    ? ReflectPreventExtensions
                    : alwaysFalse
                BoundaryProxyHandler.staticSetPrototypeOfTrap = IS_IN_SHADOW_REALM ? ReflectSetPrototypeOf : alwaysFalse
                BoundaryProxyHandler.staticSetTrap = IS_IN_SHADOW_REALM ? ReflectSet : alwaysFalse // Default traps:
                // Pending traps are needed for the shadow realm side of the membrane
                // to avoid leaking mutation operations on the primary realm side.
                BoundaryProxyHandler.defaultDefinePropertyTrap = IS_IN_SHADOW_REALM
                    ? BoundaryProxyHandler.pendingDefinePropertyTrap
                    : BoundaryProxyHandler.passthruDefinePropertyTrap
                BoundaryProxyHandler.defaultDeletePropertyTrap = IS_IN_SHADOW_REALM
                    ? BoundaryProxyHandler.pendingDeletePropertyTrap
                    : BoundaryProxyHandler.passthruDeletePropertyTrap
                BoundaryProxyHandler.defaultGetOwnPropertyDescriptorTrap =
                    BoundaryProxyHandler.passthruGetOwnPropertyDescriptorTrap
                BoundaryProxyHandler.defaultGetPrototypeOfTrap = BoundaryProxyHandler.passthruGetPrototypeOfTrap
                BoundaryProxyHandler.defaultGetTrap = IS_IN_SHADOW_REALM
                    ? BoundaryProxyHandler.hybridGetTrap
                    : BoundaryProxyHandler.passthruGetTrap
                BoundaryProxyHandler.defaultHasTrap = IS_IN_SHADOW_REALM
                    ? BoundaryProxyHandler.hybridHasTrap
                    : BoundaryProxyHandler.passthruHasTrap
                BoundaryProxyHandler.defaultIsExtensibleTrap = BoundaryProxyHandler.passthruIsExtensibleTrap
                BoundaryProxyHandler.defaultOwnKeysTrap = BoundaryProxyHandler.passthruOwnKeysTrap
                BoundaryProxyHandler.defaultPreventExtensionsTrap = IS_IN_SHADOW_REALM
                    ? BoundaryProxyHandler.pendingPreventExtensionsTrap
                    : BoundaryProxyHandler.passthruPreventExtensionsTrap
                BoundaryProxyHandler.defaultSetTrap = IS_IN_SHADOW_REALM
                    ? BoundaryProxyHandler.pendingSetTrap
                    : BoundaryProxyHandler.passthruSetTrap
                BoundaryProxyHandler.defaultSetPrototypeOfTrap = IS_IN_SHADOW_REALM
                    ? BoundaryProxyHandler.pendingSetPrototypeOfTrap
                    : BoundaryProxyHandler.passthruSetPrototypeOfTrap
                if (IS_IN_SHADOW_REALM) {
                    clearFastForeignTargetPointers()
                } // Export callable hooks to a foreign realm.
                foreignCallableHooksCallback(
                    // When crossing, should be mapped to the foreign globalThis
                    createPointer(globalThisRef),
                    !IS_IN_SHADOW_REALM
                        ? () => {
                              const result = selectedTarget
                              selectedTarget = undefined
                              return result
                          }
                        : noop,
                    (value) => {
                        if ((typeof value === 'object' && value !== null) || typeof value === 'function') {
                            return getTransferablePointer(value)
                        } // Intentionally ignoring `document.all`.
                        // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                        // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                        return typeof value === 'undefined' ? undefined : value
                    }, // the foreign realm to access a linkable pointer for a property value.
                    // In order to do that, the foreign side must provide a pointer and
                    // a key access the value in order to produce a pointer
                    (targetPointer, key) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        const value = target == null ? void 0 : target[key] // Intentionally ignoring `document.all`.
                        // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                        // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                        return createPointer(typeof value === 'undefined' ? undefined : value)
                    },
                    IS_IN_SHADOW_REALM
                        ? (sourceText) => {
                              let result
                              try {
                                  result = sourceText()
                              } catch (error) {
                                  throw pushErrorAcrossBoundary(error)
                              } // Inline getTransferableValue().
                              return (typeof result === 'object' && result !== null) || typeof result === 'function'
                                  ? getTransferablePointer(result)
                                  : result
                          }
                        : noop, // realm to define a linkage between two values across the membrane.
                    (targetPointer, newPointer) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        if ((typeof target === 'object' && target !== null) || typeof target === 'function') {
                            proxyTargetToPointerMap.set(target, newPointer)
                        }
                    },
                    LOCKER_DEBUGGABLE_FLAG
                        ? (
                              foreignTargetPointer,
                              foreignTargetTraits,
                              foreignTargetFunctionArity,
                              foreignTargetFunctionName,
                              foreignTargetTypedArrayLength,
                          ) => {
                              const pointer = pushTarget(
                                  foreignTargetPointer,
                                  foreignTargetTraits,
                                  foreignTargetFunctionArity,
                                  foreignTargetFunctionName,
                                  foreignTargetTypedArrayLength,
                              )
                              const pointerWrapper = () => {
                                  checkDebugMode()
                                  return pointer()
                              }
                              return pointerWrapper
                          }
                        : pushTarget, // to install a proxy into this realm that correspond to an object
                    // from the foreign realm. It returns a Pointer that can be used by
                    // the foreign realm to pass back a reference to this realm when
                    // passing arguments or returning from a foreign callable invocation.
                    // This function is extremely important to understand the mechanics
                    // of this membrane.
                    pushTarget,
                    (targetPointer, thisArgPointerOrUndefined, ...args) => {
                        targetPointer()
                        const func = selectedTarget
                        selectedTarget = undefined
                        let thisArg
                        if (typeof thisArgPointerOrUndefined === 'function') {
                            thisArgPointerOrUndefined()
                            thisArg = selectedTarget
                            selectedTarget = undefined
                        }
                        for (let i = 0, { length } = args; i < length; i += 1) {
                            const pointerOrPrimitive = args[i]
                            if (typeof pointerOrPrimitive === 'function') {
                                pointerOrPrimitive()
                                args[i] = selectedTarget
                                selectedTarget = undefined
                            }
                        }
                        let result
                        try {
                            result = ReflectApply(func, thisArg, args)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        } // Inline getTransferableValue().
                        return (typeof result === 'object' && result !== null) || typeof result === 'function'
                            ? getTransferablePointer(result) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                            : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                            typeof result === 'undefined'
                            ? undefined
                            : result
                    },
                    (targetPointer, newTargetPointerOrUndefined, ...args) => {
                        targetPointer()
                        const constructor = selectedTarget
                        selectedTarget = undefined
                        let newTarget
                        if (typeof newTargetPointerOrUndefined === 'function') {
                            newTargetPointerOrUndefined()
                            newTarget = selectedTarget
                            selectedTarget = undefined
                        }
                        for (let i = 0, { length } = args; i < length; i += 1) {
                            const pointerOrPrimitive = args[i]
                            if (typeof pointerOrPrimitive === 'function') {
                                pointerOrPrimitive()
                                args[i] = selectedTarget
                                selectedTarget = undefined
                            }
                        }
                        let result
                        try {
                            result = ReflectConstruct(constructor, args, newTarget)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        } // Inline getTransferableValue().
                        return (typeof result === 'object' && result !== null) || typeof result === 'function'
                            ? getTransferablePointer(result) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                            : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                            typeof result === 'undefined'
                            ? undefined
                            : result
                    },
                    (
                        targetPointer,
                        key,
                        configurable,
                        enumerable,
                        writable,
                        valuePointer,
                        getterPointer,
                        setterPointer,
                        foreignCallableNonConfigurableDescriptorCallback,
                    ) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        const safePartialDesc = createDescriptorFromMeta(
                            configurable,
                            enumerable,
                            writable,
                            valuePointer,
                            getterPointer,
                            setterPointer,
                        )
                        let result = false
                        try {
                            result = ReflectDefineProperty(target, key, safePartialDesc)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                        if (result && configurable === false) {
                            let safeDesc
                            try {
                                safeDesc = ReflectGetOwnPropertyDescriptor(target, key)
                            } catch (error) {
                                throw pushErrorAcrossBoundary(error)
                            }
                            if (safeDesc) {
                                ReflectSetPrototypeOf(safeDesc, null)
                                if (safeDesc.configurable === false) {
                                    const { get: getter, set: setter, value: value1 } = safeDesc
                                    foreignCallableNonConfigurableDescriptorCallback(
                                        key,
                                        false,
                                        'enumerable' in safeDesc
                                            ? safeDesc.enumerable
                                            : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                        'writable' in safeDesc
                                            ? safeDesc.writable
                                            : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                        'value' in safeDesc
                                            ? (typeof value1 === 'object' && value1 !== null) ||
                                              typeof value1 === 'function'
                                                ? getTransferablePointer(value1)
                                                : value1
                                            : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                        'get' in safeDesc
                                            ? typeof getter === 'function'
                                                ? getTransferablePointer(getter)
                                                : getter
                                            : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                        'set' in safeDesc
                                            ? typeof setter === 'function'
                                                ? getTransferablePointer(setter)
                                                : setter
                                            : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                    )
                                }
                            }
                        }
                        return result
                    },
                    (targetPointer, key) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        try {
                            return ReflectDeleteProperty(target, key)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                    },
                    (targetPointer, targetTraits, key, receiverPointerOrPrimitive) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let receiver
                        if (typeof receiverPointerOrPrimitive === 'function') {
                            receiverPointerOrPrimitive()
                            receiver = selectedTarget
                            selectedTarget = undefined
                        } else {
                            receiver =
                                receiverPointerOrPrimitive === LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                                    ? target
                                    : receiverPointerOrPrimitive
                        }
                        let result
                        try {
                            result = ReflectGet(target, key, receiver)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        } // Inline getTransferableValue().
                        if ((typeof result === 'object' && result !== null) || typeof result === 'function') {
                            return getTransferablePointer(result)
                        }
                        if (result === undefined && key === SymbolToStringTag && targetTraits & 16) {
                            try {
                                if (!(key in target)) {
                                    // Section 19.1.3.6 Object.prototype.toString()
                                    // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
                                    const brand = ReflectApply(ObjectProtoToString, target, []) // The default language toStringTag is "Object". If
                                    // we receive "[object Object]" we return `undefined`
                                    // to let the language resolve it naturally without
                                    // projecting a value.
                                    if (brand !== '[object Object]') {
                                        result = ReflectApply(StringProtoSlice, brand, [8, -1])
                                    }
                                }
                            } catch (error) {
                                throw pushErrorAcrossBoundary(error)
                            }
                        } // Intentionally ignoring `document.all`.
                        // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                        // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                        return typeof result === 'undefined' ? undefined : result
                    },
                    (targetPointer, key, foreignCallableDescriptorCallback) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let safeDesc
                        try {
                            safeDesc = ReflectGetOwnPropertyDescriptor(target, key)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                        if (safeDesc) {
                            ReflectSetPrototypeOf(safeDesc, null)
                            const { get: getter, set: setter, value: value1 } = safeDesc
                            foreignCallableDescriptorCallback(
                                key,
                                'configurable' in safeDesc
                                    ? safeDesc.configurable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'enumerable' in safeDesc
                                    ? safeDesc.enumerable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'writable' in safeDesc
                                    ? safeDesc.writable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'value' in safeDesc
                                    ? (typeof value1 === 'object' && value1 !== null) || typeof value1 === 'function'
                                        ? getTransferablePointer(value1) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                        : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                        typeof value1 === 'undefined'
                                        ? undefined
                                        : value1
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'get' in safeDesc
                                    ? typeof getter === 'function'
                                        ? getTransferablePointer(getter)
                                        : getter
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'set' in safeDesc
                                    ? typeof setter === 'function'
                                        ? getTransferablePointer(setter)
                                        : setter
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                            )
                        }
                    },
                    (targetPointer) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let proto
                        try {
                            proto = ReflectGetPrototypeOf(target)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        } // Intentionally ignoring `document.all`.
                        // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                        // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                        if (typeof proto === 'undefined') {
                            return null
                        }
                        return proto ? getTransferablePointer(proto) : proto
                    },
                    (targetPointer, key) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        try {
                            return key in target
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                    },
                    (targetPointer) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        try {
                            return ReflectIsExtensible(target)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                    },
                    (targetPointer, foreignCallableKeysCallback) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let ownKeys
                        try {
                            ownKeys = ReflectOwnKeys(target)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                        ReflectApply(foreignCallableKeysCallback, undefined, ownKeys)
                    },
                    (targetPointer) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let result = 2 /* PreventExtensionsResult.False */
                        try {
                            if (ReflectPreventExtensions(target)) {
                                result = 4 /* PreventExtensionsResult.True */
                            } else if (ReflectIsExtensible(target)) {
                                result |= 1 /* PreventExtensionsResult.Extensible */
                            }
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                        return result
                    },
                    (targetPointer, key, valuePointerOrPrimitive, receiverPointerOrPrimitive) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let value
                        if (typeof valuePointerOrPrimitive === 'function') {
                            valuePointerOrPrimitive()
                            value = selectedTarget
                            selectedTarget = undefined
                        } else {
                            value = valuePointerOrPrimitive
                        }
                        let receiver
                        if (typeof receiverPointerOrPrimitive === 'function') {
                            receiverPointerOrPrimitive()
                            receiver = selectedTarget
                            selectedTarget = undefined
                        } else {
                            receiver =
                                receiverPointerOrPrimitive === LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                                    ? target
                                    : receiverPointerOrPrimitive
                        }
                        try {
                            return ReflectSet(target, key, value, receiver)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                    },
                    (targetPointer, protoPointerOrNull = null) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let proto
                        if (typeof protoPointerOrNull === 'function') {
                            protoPointerOrNull()
                            proto = selectedTarget
                            selectedTarget = undefined
                        } else {
                            proto = null
                        }
                        try {
                            return ReflectSetPrototypeOf(target, proto)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                    },
                    LOCKER_DEBUGGABLE_FLAG
                        ? (...args) => {
                              if (checkDebugMode()) {
                                  for (let i = 0, { length } = args; i < length; i += 1) {
                                      const pointerOrPrimitive = args[i]
                                      if (typeof pointerOrPrimitive === 'function') {
                                          pointerOrPrimitive()
                                          args[i] = selectedTarget
                                          selectedTarget = undefined
                                      }
                                  }
                                  try {
                                      ReflectApply(consoleInfo, consoleObject, args) // eslint-disable-next-line no-empty
                                  } catch (_unused29) {}
                              }
                          }
                        : noop,
                    IS_IN_SHADOW_REALM
                        ? (targetPointer, ...descriptorTuples) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined
                              for (let i = 0, { length } = descriptorTuples; i < length; i += 7) {
                                  // We don't use `ObjectDefineProperties()` here because it
                                  // will throw an exception if it fails to define one of its
                                  // properties.
                                  ReflectDefineProperty(
                                      target,
                                      descriptorTuples[i],
                                      createDescriptorFromMeta(
                                          descriptorTuples[i + 1],
                                          descriptorTuples[i + 2],
                                          descriptorTuples[i + 3],
                                          descriptorTuples[i + 4],
                                          descriptorTuples[i + 5],
                                          descriptorTuples[i + 6], // setterPointer
                                      ),
                                  )
                              }
                          }
                        : noop,
                    !IS_IN_SHADOW_REALM
                        ? (targetPointer) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined // We don't wrap the weak map `get()` call in a try-catch
                              // because we know `target` is an object.
                              const state = __.proxyTargetToLazyPropertyDescriptorStateMap.get(target)
                              return state ? getTransferablePointer(state) : state
                          }
                        : noop,
                    !IS_IN_SHADOW_REALM
                        ? (targetPointer, index) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined
                              try {
                                  return target[index]
                              } catch (error) {
                                  throw pushErrorAcrossBoundary(error)
                              }
                          }
                        : noop,
                    !IS_IN_SHADOW_REALM
                        ? (targetPointer) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined // A target may be a proxy that is revoked or throws in its
                              // "isExtensible" trap.
                              try {
                                  if (!ReflectIsExtensible(target)) {
                                      if (ObjectIsFrozen(target)) {
                                          return 4 & 2 & 1 /* TargetIntegrityTraits.IsNotExtensible */
                                      }
                                      if (ObjectIsSealed(target)) {
                                          return 2 & 1 /* TargetIntegrityTraits.IsNotExtensible */
                                      }
                                      return 1 /* TargetIntegrityTraits.IsNotExtensible */
                                  }
                              } catch (_unused30) {
                                  try {
                                      isArrayOrThrowForRevoked(target)
                                  } catch (_unused31) {
                                      return 8 /* TargetIntegrityTraits.Revoked */
                                  }
                              }
                              return 0 /* TargetIntegrityTraits.None */
                          }
                        : () => 0,
                    (targetPointer) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        try {
                            // Section 19.1.3.6 Object.prototype.toString()
                            // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
                            const brand = ReflectApply(ObjectProtoToString, target, [])
                            return brand === '[object Object]'
                                ? 'Object'
                                : ReflectApply(StringProtoSlice, brand, [8, -1])
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                    },
                    installErrorPrepareStackTrace,
                    IS_IN_SHADOW_REALM
                        ? (targetPointer, ...ownKeysAndUnforgeableGlobalThisKeys) => {
                              const sliceIndex = ReflectApply(ArrayProtoIndexOf, ownKeysAndUnforgeableGlobalThisKeys, [
                                  LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                              ])
                              let ownKeys
                              let unforgeableGlobalThisKeys
                              if (sliceIndex === -1) {
                                  ownKeys = ownKeysAndUnforgeableGlobalThisKeys
                              } else {
                                  ownKeys = ReflectApply(ArrayProtoSlice, ownKeysAndUnforgeableGlobalThisKeys, [
                                      0,
                                      sliceIndex,
                                  ])
                                  unforgeableGlobalThisKeys = ReflectApply(
                                      ArrayProtoSlice,
                                      ownKeysAndUnforgeableGlobalThisKeys,
                                      [sliceIndex + 1],
                                  )
                              }
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined
                              let state = getLazyPropertyDescriptorStateByTarget(target)
                              if (state === undefined) {
                                  state = {
                                      __proto__: null,
                                  }
                                  setLazyPropertyDescriptorStateByTarget(target, state)
                              }
                              for (let i = 0, { length } = ownKeys; i < length; i += 1) {
                                  const ownKey = ownKeys[i]
                                  state[ownKey] = true
                                  ReflectDefineProperty(
                                      target,
                                      ownKey, // bouncer. When either a getter or a setter is
                                      // invoked the descriptor will be replaced with
                                      // the descriptor from the foreign side and the
                                      // get/set operation will carry on from there.
                                      {
                                          __proto__: null,
                                          // We DO explicitly set configurability in the
                                          // off chance that the property doesn't exist.
                                          configurable: true,
                                          // We DON'T explicitly set enumerability to
                                          // defer to the enumerability of the existing
                                          // property. In the off chance the property
                                          // doesn't exist the property will be defined
                                          // as non-enumerable.
                                          get() {
                                              activateLazyOwnPropertyDefinition(target, ownKey, state)
                                              return target[ownKey]
                                          },
                                          set(value) {
                                              activateLazyOwnPropertyDefinition(target, ownKey, state)
                                              ReflectSet(target, ownKey, value)
                                          },
                                      },
                                  )
                              }
                              installPropertyDescriptorMethodWrappers(unforgeableGlobalThisKeys)
                          }
                        : noop,
                    !IS_IN_SHADOW_REALM && liveTargetCallback
                        ? (targetPointer, targetTraits) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined
                              if (target !== ObjectProto && target !== RegExpProto) {
                                  try {
                                      return liveTargetCallback(target, targetTraits) // eslint-disable-next-line no-empty
                                  } catch (_unused32) {}
                              }
                              return false
                          }
                        : alwaysFalse,
                    !IS_IN_SHADOW_REALM
                        ? (targetPointer) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined
                              try {
                                  isArrayOrThrowForRevoked(target)
                                  return false //  eslint-disable-next-line no-empty
                              } catch (_unused33) {}
                              return true
                          }
                        : alwaysFalse,
                    IS_IN_SHADOW_REALM
                        ? (targetPointer) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined
                              try {
                                  return SymbolToStringTag in target
                                      ? serializeTargetByTrialAndError(target)
                                      : serializeTargetByBrand(target) // eslint-disable-next-line no-empty
                              } catch (_unused34) {}
                              return undefined
                          }
                        : noop,
                    !IS_IN_SHADOW_REALM
                        ? (targetPointer, statePointer) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined
                              statePointer()
                              const state = selectedTarget
                              selectedTarget = undefined // We don't wrap the weak map `set()` call in a try-catch
                              // because we know `target` is an object.
                              __.proxyTargetToLazyPropertyDescriptorStateMap.set(target, state)
                          }
                        : noop,
                    !IS_IN_SHADOW_REALM
                        ? (targetPointer) => {
                              targetPointer()
                              const target = selectedTarget
                              selectedTarget = undefined
                              if (useFastForeignTargetPath) {
                                  fastForeignTargetPointers.add(getTransferablePointer(target))
                              }
                          }
                        : noop,
                    (targetPointer, foreignCallableDescriptorsCallback) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let unsafeDescMap
                        try {
                            unsafeDescMap = ObjectGetOwnPropertyDescriptors(target)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                        const ownKeys = ReflectOwnKeys(unsafeDescMap)
                        const { length } = ownKeys
                        const descriptorTuples = new ArrayCtor(length * 7)
                        for (let i = 0, j = 0; i < length; i += 1, j += 7) {
                            const ownKey = ownKeys[i]
                            const safeDesc = unsafeDescMap[ownKey]
                            ReflectSetPrototypeOf(safeDesc, null)
                            const { get: getter, set: setter, value: value1 } = safeDesc
                            descriptorTuples[j] = ownKey
                            descriptorTuples[j + 1] =
                                'configurable' in safeDesc
                                    ? safeDesc.configurable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                            descriptorTuples[j + 2] =
                                'enumerable' in safeDesc
                                    ? safeDesc.enumerable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                            descriptorTuples[j + 3] =
                                'writable' in safeDesc ? safeDesc.writable : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                            descriptorTuples[j + 4] =
                                'value' in safeDesc
                                    ? (typeof value1 === 'object' && value1 !== null) || typeof value1 === 'function'
                                        ? getTransferablePointer(value1)
                                        : value1
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                            descriptorTuples[j + 5] =
                                'get' in safeDesc
                                    ? typeof getter === 'function'
                                        ? getTransferablePointer(getter)
                                        : getter
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                            descriptorTuples[j + 6] =
                                'set' in safeDesc
                                    ? typeof setter === 'function'
                                        ? getTransferablePointer(setter)
                                        : setter
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL
                        }
                        ReflectApply(foreignCallableDescriptorsCallback, undefined, descriptorTuples)
                        let proto
                        try {
                            proto = ReflectGetPrototypeOf(target)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        } // Intentionally ignoring `document.all`.
                        // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                        // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                        if (typeof proto === 'undefined') {
                            return null
                        }
                        return proto ? getTransferablePointer(proto) : proto
                    },
                    (targetPointer, key) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let proto
                        try {
                            if (ObjectHasOwn(target, key)) {
                                return true
                            }
                            proto = ReflectGetPrototypeOf(target)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        } // Intentionally ignoring `document.all`.
                        // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                        // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                        if (typeof proto === 'undefined') {
                            return null
                        }
                        return proto ? getTransferablePointer(proto) : proto
                    },
                    (targetPointer, key, foreignCallableDescriptorCallback) => {
                        targetPointer()
                        const target = selectedTarget
                        selectedTarget = undefined
                        let safeDesc
                        try {
                            safeDesc = ReflectGetOwnPropertyDescriptor(target, key)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        }
                        if (safeDesc) {
                            ReflectSetPrototypeOf(safeDesc, null)
                            const { get: getter, set: setter, value: value1 } = safeDesc
                            foreignCallableDescriptorCallback(
                                key,
                                'configurable' in safeDesc
                                    ? safeDesc.configurable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'enumerable' in safeDesc
                                    ? safeDesc.enumerable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'writable' in safeDesc
                                    ? safeDesc.writable
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'value' in safeDesc
                                    ? (typeof value1 === 'object' && value1 !== null) || typeof value1 === 'function'
                                        ? getTransferablePointer(value1) // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                                        : // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                                        typeof value1 === 'undefined'
                                        ? undefined
                                        : value1
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'get' in safeDesc
                                    ? typeof getter === 'function'
                                        ? getTransferablePointer(getter)
                                        : getter
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                                'set' in safeDesc
                                    ? typeof setter === 'function'
                                        ? getTransferablePointer(setter)
                                        : setter
                                    : LOCKER_NEAR_MEMBRANE_UNDEFINED_VALUE_SYMBOL,
                            )
                            return undefined
                        }
                        let proto
                        try {
                            proto = ReflectGetPrototypeOf(target)
                        } catch (error) {
                            throw pushErrorAcrossBoundary(error)
                        } // Intentionally ignoring `document.all`.
                        // https://developer.mozilla.org/en-US/docs/Web/API/Document/all
                        // https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
                        if (typeof proto === 'undefined') {
                            return null
                        }
                        return proto ? getTransferablePointer(proto) : proto
                    },
                )
                let foreignCallablesHooked = false
                return (...hooks) => {
                    if (foreignCallablesHooked) {
                        return
                    }
                    foreignCallablesHooked = true
                    ;({
                        // 0: globalThisPointer,
                        // 1: getSelectedTarget,
                        // 2: getTransferableValue,
                        // 3: callableGetPropertyValuePointer,
                        // 4: callableEvaluate,
                        // 5: callableLinkPointers,
                        6: foreignCallablePushErrorTarget,
                        7: foreignCallablePushTarget,
                        8: foreignCallableApply,
                        9: foreignCallableConstruct,
                        10: foreignCallableDefineProperty,
                        11: foreignCallableDeleteProperty,
                        12: foreignCallableGet,
                        13: foreignCallableGetOwnPropertyDescriptor,
                        14: foreignCallableGetPrototypeOf,
                        15: foreignCallableHas,
                        16: foreignCallableIsExtensible,
                        17: foreignCallableOwnKeys,
                        18: foreignCallablePreventExtensions,
                        19: foreignCallableSet,
                        20: foreignCallableSetPrototypeOf,
                        21: foreignCallableDebugInfo, // 22: callableDefineProperties,
                        23: foreignCallableGetLazyPropertyDescriptorStateByTarget,
                        24: foreignCallableGetPropertyValue,
                        25: foreignCallableGetTargetIntegrityTraits,
                        26: foreignCallableGetToStringTagOfTarget,
                        27: foreignCallableInstallErrorPrepareStackTrace, // 28: callableInstallLazyPropertyDescriptors,
                        29: foreignCallableIsTargetLive,
                        30: foreignCallableIsTargetRevoked,
                        31: foreignCallableSerializeTarget,
                        32: foreignCallableSetLazyPropertyDescriptorStateByTarget, // 33: foreignCallableTrackAsFastTarget,
                        34: foreignCallableBatchGetPrototypeOfAndGetOwnPropertyDescriptors,
                        35: foreignCallableBatchGetPrototypeOfWhenHasNoOwnProperty,
                        36: foreignCallableBatchGetPrototypeOfWhenHasNoOwnPropertyDescriptor,
                    } = hooks)
                    const applyTrapForZeroOrMoreArgs = createApplyOrConstructTrapForZeroOrMoreArgs(1)
                    const applyTrapForOneOrMoreArgs = createApplyOrConstructTrapForOneOrMoreArgs(1)
                    const applyTrapForTwoOrMoreArgs = createApplyOrConstructTrapForTwoOrMoreArgs(1)
                    const applyTrapForThreeOrMoreArgs = createApplyOrConstructTrapForThreeOrMoreArgs(1)
                    const applyTrapForFourOrMoreArgs = createApplyOrConstructTrapForFourOrMoreArgs(1)
                    const applyTrapForFiveOrMoreArgs = createApplyOrConstructTrapForFiveOrMoreArgs(1)
                    const applyTrapForAnyNumberOfArgs = createApplyOrConstructTrapForAnyNumberOfArgs(1)
                    const constructTrapForZeroOrMoreArgs = createApplyOrConstructTrapForZeroOrMoreArgs(2)
                    const constructTrapForOneOrMoreArgs = createApplyOrConstructTrapForOneOrMoreArgs(2)
                    const constructTrapForTwoOrMoreArgs = createApplyOrConstructTrapForTwoOrMoreArgs(2)
                    const constructTrapForThreeOrMoreArgs = createApplyOrConstructTrapForThreeOrMoreArgs(2)
                    const constructTrapForFourOrMoreArgs = createApplyOrConstructTrapForFourOrMoreArgs(2)
                    const constructTrapForFiveOrMoreArgs = createApplyOrConstructTrapForFiveOrMoreArgs(2)
                    const constructTrapForAnyNumberOfArgs = createApplyOrConstructTrapForAnyNumberOfArgs(2)
                    if (MINIFICATION_SAFE_TRAP_PROPERTY_NAMES === undefined) {
                        // A minification safe way to get the 'apply' and 'construct'
                        // trap property names.
                        MINIFICATION_SAFE_TRAP_PROPERTY_NAMES = ObjectKeys({
                            applyTrapForZeroOrMoreArgs,
                            applyTrapForOneOrMoreArgs,
                            applyTrapForTwoOrMoreArgs,
                            applyTrapForThreeOrMoreArgs,
                            applyTrapForFourOrMoreArgs,
                            applyTrapForFiveOrMoreArgs,
                            applyTrapForAnyNumberOfArgs,
                            constructTrapForZeroOrMoreArgs,
                            constructTrapForOneOrMoreArgs,
                            constructTrapForTwoOrMoreArgs,
                            constructTrapForThreeOrMoreArgs,
                            constructTrapForFourOrMoreArgs,
                            constructTrapForFiveOrMoreArgs,
                            constructTrapForAnyNumberOfArgs,
                        })
                    }
                    arityToApplyTrapNameRegistry[0] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[0]
                    arityToApplyTrapNameRegistry[1] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[1]
                    arityToApplyTrapNameRegistry[2] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[2]
                    arityToApplyTrapNameRegistry[3] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[3]
                    arityToApplyTrapNameRegistry[4] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[4]
                    arityToApplyTrapNameRegistry[5] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[5]
                    arityToApplyTrapNameRegistry.n = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[6]
                    arityToConstructTrapNameRegistry[0] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[7]
                    arityToConstructTrapNameRegistry[1] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[8]
                    arityToConstructTrapNameRegistry[2] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[9]
                    arityToConstructTrapNameRegistry[3] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[10]
                    arityToConstructTrapNameRegistry[4] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[11]
                    arityToConstructTrapNameRegistry[5] = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[12]
                    arityToConstructTrapNameRegistry.n = MINIFICATION_SAFE_TRAP_PROPERTY_NAMES[13]
                    const { prototype: BoundaryProxyHandlerProto } = BoundaryProxyHandler
                    BoundaryProxyHandlerProto[arityToApplyTrapNameRegistry[0]] = applyTrapForZeroOrMoreArgs
                    BoundaryProxyHandlerProto[arityToApplyTrapNameRegistry[1]] = applyTrapForOneOrMoreArgs
                    BoundaryProxyHandlerProto[arityToApplyTrapNameRegistry[2]] = applyTrapForTwoOrMoreArgs
                    BoundaryProxyHandlerProto[arityToApplyTrapNameRegistry[3]] = applyTrapForThreeOrMoreArgs
                    BoundaryProxyHandlerProto[arityToApplyTrapNameRegistry[4]] = applyTrapForFourOrMoreArgs
                    BoundaryProxyHandlerProto[arityToApplyTrapNameRegistry[5]] = applyTrapForFiveOrMoreArgs
                    BoundaryProxyHandlerProto[arityToApplyTrapNameRegistry.n] = applyTrapForAnyNumberOfArgs
                    BoundaryProxyHandlerProto[arityToConstructTrapNameRegistry[0]] = constructTrapForZeroOrMoreArgs
                    BoundaryProxyHandlerProto[arityToConstructTrapNameRegistry[1]] = constructTrapForOneOrMoreArgs
                    BoundaryProxyHandlerProto[arityToConstructTrapNameRegistry[2]] = constructTrapForTwoOrMoreArgs
                    BoundaryProxyHandlerProto[arityToConstructTrapNameRegistry[3]] = constructTrapForThreeOrMoreArgs
                    BoundaryProxyHandlerProto[arityToConstructTrapNameRegistry[4]] = constructTrapForFourOrMoreArgs
                    BoundaryProxyHandlerProto[arityToConstructTrapNameRegistry[5]] = constructTrapForFiveOrMoreArgs
                    BoundaryProxyHandlerProto[arityToConstructTrapNameRegistry.n] = constructTrapForAnyNumberOfArgs
                    ReflectSetPrototypeOf(BoundaryProxyHandlerProto, null) // Future optimization: Hoping proxies with frozen handlers can be faster.
                    ObjectFreeze(BoundaryProxyHandlerProto)
                }
            }
            /* eslint-enable prefer-object-spread */
        }
        __.default = createMembraneMarshall
    },
}
