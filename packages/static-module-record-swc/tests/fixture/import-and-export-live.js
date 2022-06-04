export let x, y
export { x as z }

export function setX(value) {
    x = value
}

function setAll() {
    [x, y] = [1, 2, 3]
}
