import { clone } from './utils/clone.js'

const localThis = clone(globalThis, {
    clonedFromOriginal: new WeakMap(),
    emptyObjectOverride: new WeakMap(),
    descriptorOverride: new WeakMap(),
})
const a = new localThis.WeakMap()
a.set({}, 1)
