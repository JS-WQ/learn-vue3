import { h, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
    name: "Foo",
    setup() {
        const instace = getCurrentInstance()
        console.log("Foo:",instace);
    },
    render() {
        return h("div",{},"foo")
    }
}