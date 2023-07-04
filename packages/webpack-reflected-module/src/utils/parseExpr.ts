import type { Expression } from 'estree'
import { WebpackError } from 'webpack'
import type { EvaluateExpression } from '../webpack'

export interface ImportReflectionOptions {
    exclude: undefined | '*' | string[]
    request: string
}
const UNKNOWN_EXCLUDES = 'excludes option of import reflection can only use "*" | string[] | undefined.'
const NO_DYNAMIC_EXPRESSION = 'import reflection does not support dynamic expression yet.'
/**
 * Get option for import reflection. null means we should not handle this import call.
 */
export function getImportReflectionOptions(
    expression: Expression,
    evaluateExpression: EvaluateExpression,
): ImportReflectionOptions | WebpackError | null {
    if (expression.type !== 'ImportExpression') return null

    // get 2nd argument
    if (!('arguments' in expression)) return null
    const [importCallOptions, ...rest] = expression.arguments as Expression[]
    if (!importCallOptions || rest.length) return null
    const optionsExpression = evaluateExpression(importCallOptions)
    if (optionsExpression.expression?.type !== 'ObjectExpression') return null

    let request: string | undefined = undefined
    let exclude: ImportReflectionOptions['exclude'] = undefined
    let meetOurOptions = false

    for (const property of optionsExpression.expression.properties) {
        if (property.type === 'SpreadElement') return null
        if (property.key.type === 'PrivateIdentifier') return null

        const key = evaluateExpression(property.key)
        if (
            property.value.type === 'ObjectPattern' ||
            property.value.type === 'ArrayPattern' ||
            property.value.type === 'RestElement' ||
            property.value.type === 'AssignmentPattern'
        ) {
            return null
        }

        if (key.identifier === 'reflect' || key.string === 'reflect') {
            meetOurOptions = true
            const value = evaluateExpression(property.value)
            if (value.string === 'module') {
                const spec = evaluateExpression(expression.source)
                if (!spec.isString()) return createErrorForExpression(NO_DYNAMIC_EXPRESSION, expression)
                request = spec.string
            } else {
                return null
            }
        } else if (key.identifier === 'excludes' || key.string === 'excludes') {
            meetOurOptions = true
            const value = evaluateExpression(property.value)
            if (value.isString()) {
                if (value.string !== '*') return createErrorForExpression(UNKNOWN_EXCLUDES, expression)
                exclude = '*'
            } else if (value.isArray()) {
                if (!value.items?.every((x) => x.isString())) return null
                exclude = value.items.map((x) => x.string!)
            } else if (!value.isUndefined()) {
                return createErrorForExpression(UNKNOWN_EXCLUDES, expression)
            }
        } else {
            if (meetOurOptions) {
                return createErrorForExpression(
                    `import reflection does not support unknown option ${key.identifier || key.string}`,
                    expression,
                )
            }
            return null
        }
    }
    if (request === undefined) return null
    return { exclude, request }
}
function createErrorForExpression(message: string, node: Expression) {
    const error = new WebpackError(message)
    error.name = 'ImportReflectionError'
    if (node.loc) error.loc = node.loc
    return error
}
