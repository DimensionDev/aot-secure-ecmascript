/// {"template": {"type": "callback-cwd", "callback": "__register", "cwd": "BLANK_IN_TEST"}}
import { writeFile } from 'node:fs/promises'

export const url = new URL('./here.txt', import.meta.url)
await writeFile(url, 'Hello World')
