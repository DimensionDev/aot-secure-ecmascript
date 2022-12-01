import { util, Module } from 'webpack'
import type {
    NormalModuleFactory,
    ModuleFactoryCreateData,
    ModuleFactoryCreateDataCallback,
    ResolveData,
} from '../webpack'
import { ReflectedModuleDependency } from './dependency'
import { ReflectedModule } from './module'

export class ReflectedModuleFactory {
    constructor(private normalModuleFactory: NormalModuleFactory) {}
    create(data: ModuleFactoryCreateData, callback: ModuleFactoryCreateDataCallback) {
        const { contextInfo, context, resolveOptions, dependencies } = data
        assertReflectedDependencyArray(dependencies)

        const [dependency] = dependencies
        if (dependencies.length !== 1) {
            // we assert all dependencies are equal,
            // otherwise webpack should split them into different create calls
            // this is based on my simple experiment and observation
            const target = dependency.request
            // TODO: test if webpack will feed request with different exclude options to us
            for (const dep of dependencies) {
                if (dep.request !== target) {
                    throw new Error('Assert failed: webpack feed different dependency in a single create call')
                }
            }
        }
        const { request } = dependency
        const fileDependencies = new util.LazySet<string>() as util.LazySet<string> & Set<string>
        const missingDependencies = new util.LazySet<string>() as util.LazySet<string> & Set<string>
        const contextDependencies = new util.LazySet<string>() as util.LazySet<string> & Set<string>

        const resolveData: ResolveData = {
            contextInfo,
            resolveOptions: resolveOptions!,
            context,
            request,
            // assertions: undefined!,
            dependencies,
            dependencyType: dependency.type,
            fileDependencies,
            missingDependencies,
            contextDependencies,
            createData: {},
            cacheable: true,
        }

        this.normalModuleFactory.hooks.beforeResolve.callAsync(resolveData, (err, result) => {
            if (err) {
                return callback(err, {
                    fileDependencies,
                    missingDependencies,
                    contextDependencies,
                    cacheable: false,
                })
            }
            if (result === false) {
                return callback(undefined, {
                    fileDependencies,
                    missingDependencies,
                    contextDependencies,
                    cacheable: resolveData.cacheable,
                })
            }
            this.normalModuleFactory.hooks.resolve.callAsync(resolveData, (err, result) => {
                if (err) return callback(err)
                if (result === false) return callback()
                // note: deprecated path
                if (result instanceof Module) return callback(undefined, result as any)

                this.normalModuleFactory.hooks.afterResolve.callAsync(resolveData, (err, result) => {
                    if (err) return callback(err)
                    if (result === false) return callback()
                    const createData = resolveData.createData
                    callback(undefined, {
                        cacheable: resolveData.cacheable,
                        module: new ReflectedModule(createData),
                        contextDependencies,
                        fileDependencies,
                        missingDependencies,
                    })
                })
            })
        })
    }
}
function assertReflectedDependencyArray(
    array: unknown[],
): asserts array is [ReflectedModuleDependency, ...ReflectedModuleDependency[]] {
    if (array.length === 0) throw new TypeError(`${ReflectedModuleFactory.name} receives an empty array`)
    if (!array.every((x) => x instanceof ReflectedModuleDependency)) {
        throw new TypeError(
            `${ReflectedModuleFactory.name} receives an array with something is not a ${ReflectedModuleDependency.name}`,
        )
    }
}
