import { h, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './foo.js';
export const App = {
    name: "App",
    render() {
        return h('div',{},[h("p",{},"currentInstance demo"),h(Foo)])
    },
    setup() {
        const instace = getCurrentInstance()
        console.log('App:',instace);
    }
}