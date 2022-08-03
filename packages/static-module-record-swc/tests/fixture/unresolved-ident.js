globalThis // global lookup
function f(globalThis) {
    globalThis // local lookup
}

const obj = {
    a, // global lookup
}

// update expressions
a = 1;
({ a } = { a: 2 });
[a, b] = [1, 2];
({ ...a } = expr);
a *= 4;
a++

// local vairable
function yy({ a = x }) {}

// tagged template
css`
    body {}
`
