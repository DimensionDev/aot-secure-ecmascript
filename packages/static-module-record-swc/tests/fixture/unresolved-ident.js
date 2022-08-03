globalThis // global lookup
window

function f(globalThis) {
    globalThis // local lookup
}

const x = {
    a // global lookup
}

a = 1
