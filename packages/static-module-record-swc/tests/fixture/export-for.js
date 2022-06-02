export var x, y
for (var x of [1, 2]) {
    console.log(x)
}

for ([x, y] of [[1, 2], [2, 3]]) {
    console.log(x)
}
