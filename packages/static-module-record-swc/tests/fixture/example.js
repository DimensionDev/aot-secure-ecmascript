// @ts-nocheck
import { utils } from 'host'

console.log(utils)

export default function init() {
    utils.ready.then((f) => {
        init = f
    })
    throw utils.ready
}

export let item = 0
export function add() {
    item++
}
