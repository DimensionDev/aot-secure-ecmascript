import type { dependencies, Compilation, javascript, Module, ModuleOptions } from 'webpack'

export type NormalModuleFactory = Compilation['params']['normalModuleFactory']
export type ModuleFactoryCreateData = Parameters<NormalModuleFactory['create']>[0]
export type ModuleFactoryCreateDataCallback = Parameters<NormalModuleFactory['create']>[1]
export type CodeGenerationResult = ReturnType<Module['codeGeneration']>
export type EvaluateExpression = javascript.JavascriptParser['evaluateExpression']
export type ResolveData = Parameters<(typeof import('webpack').IgnorePlugin)['prototype']['checkIgnore']>[0]
export type DependencyTemplateContext = Parameters<
    (typeof dependencies.ModuleDependency.Template)['prototype']['apply']
>[2]
export type JavascriptParserOptions = NonNullable<ModuleOptions['parser']>['javascript/auto']
