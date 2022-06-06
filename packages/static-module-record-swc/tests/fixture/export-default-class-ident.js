// TODO: binding should be { export: "default" } instead of { export: "x", as: "default" }
export default class T {}

if (Math.random()) {
    T = class T2 {}
}
