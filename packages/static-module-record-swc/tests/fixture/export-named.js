export { a, a as b, c }

{
    var a = 1
    function c() {
        a = 2
    }
}

export { f }

{
    for (var f = 0; f < [].length; f++) {
    }

    for (f of []) { }

    for (f in {}) { }
}

export { x1, x2, x3 }

let [x1, { key: x2, ...x3 }] = expr;
[x1, x2, x3] = expr2;
