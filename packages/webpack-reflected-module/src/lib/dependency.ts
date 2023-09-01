import type { SourceLocation } from 'estree'
import { AsyncDependenciesBlock, dependencies, Dependency, type sources } from 'webpack'
import type { ImportReflectionOptions } from '../utils/parseExpr'
import type { DependencyTemplateContext } from '../webpack'

const DependencyTemplate = dependencies.ModuleDependency.Template

export class ReflectedModuleDependency extends Dependency {
    declare userRequest: string
    constructor(
        public request: string,
        public override loc: SourceLocation,
        public range: [number, number],
        public excludes: ImportReflectionOptions['exclude'],
    ) {
        super()
    }
    override get type() {
        return 'import() reflected'
    }
    override get category() {
        return 'esm'
    }
    override getResourceIdentifier() {
        return `import() reflected ${this.request}|${this.excludes}`
    }

    static Template = class ReflectedModuleTemplate extends DependencyTemplate {
        override apply(
            dep: ReflectedModuleDependency,
            source: sources.ReplaceSource,
            context: DependencyTemplateContext,
        ) {
            const { moduleGraph, chunkGraph, runtimeTemplate, runtimeRequirements, module } = context
            const block = moduleGraph.getParentBlock(dep) as AsyncDependenciesBlock
            const content = runtimeTemplate.moduleNamespacePromise({
                chunkGraph,
                block,
                module: moduleGraph.getModule(dep)!,
                request: dep.request,
                strict: module.buildMeta?.strictHarmonyModule!,
                message: 'import() reflected',
                runtimeRequirements,
            })

            source.replace(dep.range[0], dep.range[1] - 1, content)
        }
    }
}
