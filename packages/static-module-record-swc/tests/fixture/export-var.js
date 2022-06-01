export const a = 1
export const [b, c] = [1, 2]
export const { alert, ...rest } = globalThis
export const [d, ...[{ x = 1 }]] = [1, { x: 1 }]

export { a as z }

export {T}
class T {}
