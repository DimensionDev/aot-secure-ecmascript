export var a1
export var a2, a3

export let b1
export let b2, b3

export const c1 = 0
export const c2 = 0,
    c3 = 0

export function f() {
    f = function () {}
    T = class T2 { }

    c1 = c2 = c3 = a1 = a2 = a3 = b1 = b2 = b3 = 0
}
export class T {}


export let [x1, { key: x2, ...x3 }] = expr;
[x1, x2, x3] = expr2;
