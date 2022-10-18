let asyncTaskPolyfill: Task
function getAsyncTaskAPI() {
    // if (typeof console === 'object' && typeof console.createTask === 'function') return console.createTask
    return (_name: string): Task =>
        (asyncTaskPolyfill ||= {
            run: Function.prototype.call.bind(Function.call),
        })
}
/**
 * @internal
 * @see https://developer.chrome.com/docs/devtools/console/api/#createtask
 */
export const createTask = /*#__PURE__*/ getAsyncTaskAPI()

// declaration
interface Console {
    createTask?(name: string): Task
}

export interface Task {
    run<T>(f: () => T): T
}
declare const console: Console | undefined
