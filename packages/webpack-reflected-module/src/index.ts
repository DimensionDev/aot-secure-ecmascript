import { AsyncDependenciesBlock, WebpackError, Compiler, javascript } from 'webpack'
import { getImportReflectionOptions } from './utils/parseExpr'
import { ReflectedModuleDependency } from './lib/dependency'
import { ReflectedModuleFactory } from './lib/moduleFactory'
import type { JavascriptParserOptions } from './webpack'

export = class ImportReflectionPlugin {
    apply(compiler: Compiler) {
        compiler.hooks.compilation.tap(ImportReflectionPlugin.name, (compilation, { normalModuleFactory }) => {
            compilation.dependencyTemplates.set(ReflectedModuleDependency, new ReflectedModuleDependency.Template())
            compilation.dependencyFactories.set(
                ReflectedModuleDependency,
                new ReflectedModuleFactory(normalModuleFactory),
            )
            // we parse import('spec', { reflect: "module" }) and handle it.
            function parserHandler(parser: javascript.JavascriptParser, options: JavascriptParserOptions) {
                parser.hooks.importCall.tap('BundleTransitiveAsVirtualModuleSource', (expression) => {
                    if (!expression.loc || !expression.range) return
                    const result = getImportReflectionOptions(expression, (e) => parser.evaluateExpression(e))
                    if (result === null) return
                    if (result instanceof WebpackError) {
                        parser.state.current.addError(result)
                        return
                    }

                    const { request, exclude } = result
                    // TODO: support magic comments: chunkName, prefetchOrder, preloadOrder, exports
                    const dependencyBlock = new AsyncDependenciesBlock({}, expression.loc, request)
                    const dependency = new ReflectedModuleDependency(request, expression.loc, expression.range, exclude)
                    dependencyBlock.addDependency(dependency)
                    parser.state.current.addBlock(dependencyBlock)
                    return true
                })
            }
            normalModuleFactory.hooks.parser.for('javascript/auto').tap(ImportReflectionPlugin.name, parserHandler)
            normalModuleFactory.hooks.parser.for('javascript/esm').tap(ImportReflectionPlugin.name, parserHandler)
        })
    }
}
