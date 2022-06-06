import { writeFile } from 'node:fs/promises'

export const url = new URL('./here.txt', import.meta.url)
await writeFile(url, 'Hello World')
