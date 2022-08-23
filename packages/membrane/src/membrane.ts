import lib from './createMembraneMarshall.js'
import type { VirtualEnvironmentOptions } from '@locker/near-membrane-base'

export function createRedConnector(globalThis: object): VirtualEnvironmentOptions['redConnector'] {
    let f: Function
    lib.execute(
        {
            set default(value: Function) {
                f = value
            },
        },
        { globalThis },
    )
    if (!f!) throw new Error('Internal error')
    return f()
}
