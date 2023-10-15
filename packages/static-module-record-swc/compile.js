import { transform } from './eval.js'
import { writeFile } from 'node:fs/promises'

await writeFile(
    './out.js',
    transform(`
    for([x] of [[1],[2, 3], [4,5, 6]]);
    var x; export {x}
`),
)
