import { getContext } from 'loader-runner'
import { Module, sources, type Compilation, WebpackError, NormalModule, RuntimeGlobals, util } from 'webpack'
import type { CodeGenerationResult } from '../webpack'
import { build } from 'esbuild'
import { transform } from '@swc/core'

export class ReflectedModule extends Module {
    request: string
    userRequest: string | undefined
    error: Error | undefined
    _source: sources.Source | undefined
    _sourceSizes: Map<string, number> | undefined
    /**
     * @param {Parameters<typeof import('webpack').IgnorePlugin['prototype']['checkIgnore']>[0]['createData']} data
     */
    constructor(
        data: Parameters<(typeof import('webpack').IgnorePlugin)['prototype']['checkIgnore']>[0]['createData'],
    ) {
        const { resource, request, context = getContext(resource!), layer, userRequest } = data
        super('javascript/esm/reflection', context, layer)
        if (!request) throw new Error('No request')
        this.request = request
        this.userRequest = userRequest
        this.error = undefined
        this._source = undefined
        this._sourceSizes = undefined
    }
    override identifier() {
        if (this.layer === null) {
            return `${this.type}|${this.request}`
        } else {
            return `${this.type}|${this.request}|${this.layer}`
        }
    }

    /**
     * @param {import('webpack').Compilation['requestShortener']} requestShortener the request shortener
     * @returns {string} a user readable identifier of the module
     */
    override readableIdentifier(requestShortener: import('webpack').Compilation['requestShortener']): string {
        return requestShortener.shorten(this.userRequest)!
    }

    /**
     * @param {import('webpack').WebpackOptionsNormalized} options webpack options
     * @param {Compilation} compilation the compilation
     * @param {Parameters<import('webpack').Module['build']>[2]} resolver the resolver
     * @param {Parameters<import('webpack').Module['build']>[3]} fs the file system
     * @param {function(WebpackError=): void} callback callback function
     * @returns {void}
     */
    override build(
        options: import('webpack').WebpackOptionsNormalized,
        compilation: Compilation,
        resolver: Parameters<import('webpack').Module['build']>[2],
        fs: Parameters<import('webpack').Module['build']>[3],
        callback: (arg0: WebpackError | undefined) => void,
    ): void {
        this.error = undefined
        this.clearWarningsAndErrors()
        this.clearDependenciesAndBlocks()
        this.buildMeta = {}
        const info = (this.buildInfo = {
            // TODO: support cache
            cacheable: false,
            parsed: false,
            fileDependencies: new util.LazySet(),
            contextDependencies: new util.LazySet(),
            missingDependencies: new util.LazySet(),
            buildDependencies: new util.LazySet(),
            valueDependencies: new util.LazySet(),
            hash: undefined,
            assets: undefined,
            assetsInfo: undefined,
        })
        info.buildDependencies.addAll([
            require.resolve('esbuild/package.json'),
            require.resolve('@swc/core/package.json'),
            require.resolve('@masknet/static-module-record-swc/package.json'),
        ])
        build({
            entryPoints: { main: this.request! },
            target: 'esnext',
            // TODO:
            platform: 'browser',
            bundle: true,
            // TODO:
            define: {},
            absWorkingDir: this.context || undefined!,
            // TODO:
            external: [],
            write: false,
            format: 'esm',
            // https://esbuild.github.io/api/#incremental
            // incremental: true,
            metafile: true,
        })
            .then((result) => {
                // TODO: use metafile to fill dependencies
                // TODO: report errors
                // TODO: report warnings
                const esm = result.outputFiles[0]!.text
                return transform(esm, {
                    jsc: {
                        experimental: {
                            plugins: [
                                [
                                    '@masknet/static-module-record-swc',
                                    {
                                        template: {
                                            type: 'export-default',
                                        },
                                    },
                                ],
                            ],
                        },
                        target: 'es2022',
                    },
                })
            })
            .then(({ code }) => {
                // Note: duck typing call here! it is using .identifier() at the time of writing this.
                this._source = NormalModule.prototype.createSource.call(
                    this,
                    options.context!,
                    code.replace(/^export default /, 'module.exports = '),
                    /** sourceMap */ undefined,
                    compilation.compiler.root,
                )
                this._sourceSizes?.clear()
                // @ts-expect-error duck typing call here! it is using this.buildInfo and this._source
                NormalModule.prototype._initBuildHash.call(this, compilation)
                // TODO: handle cache logic in NormalModule.build/handleBuildDone
                callback(undefined)
            })
            .catch((error) => {
                callback(new WebpackError(`Failed to call esbuild: ${error.message}`))
            })
    }
    override getSourceTypes() {
        return new Set(['javascript'])
    }
    override size() {
        return this._source?.size() ?? 39 // magic number in JavascriptGenerator?
    }
    override codeGeneration(context: Parameters<Module['codeGeneration']>[0]): any {
        const runtimeRequirements: Set<string> = new Set()

        if (!this.buildInfo?.['parsed']) {
            runtimeRequirements.add(RuntimeGlobals.module)
            runtimeRequirements.add(RuntimeGlobals.exports)
            runtimeRequirements.add(RuntimeGlobals.thisAsExports)
        }

        let data: Map<string, any> = new Map()
        const sourcesMap = new Map()
        for (const type of context.sourceTypes || context.chunkGraph.getModuleSourceTypes(this)) {
            const source =
                this.error ?
                    new sources.RawSource('throw new Error(' + JSON.stringify(this.error.message) + ');')
                :   this._source

            if (source) {
                sourcesMap.set(type, new sources.CachedSource(source))
            }
        }

        const resultEntry: CodeGenerationResult = {
            sources: sourcesMap,
            runtimeRequirements,
            data,
        }
        return resultEntry
    }
    override addCacheDependencies(
        fileDependencies: util.LazySet<string>,
        contextDependencies: util.LazySet<string>,
        missingDependencies: util.LazySet<string>,
        buildDependencies: util.LazySet<string>,
    ) {}
}
