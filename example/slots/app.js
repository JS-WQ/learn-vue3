import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './foo.js';
export const App = {
    name: "App",
    render() {
        return h("div", {},
            [
                h('p', {}, `App.msg: ${this.msg}`),
                // h(Foo, {}, h('span', {}, 'ABC')),
                h(Foo, {}, { header: ({ age }) => h('span', {}, '123' + age), footer: () => h('span', {}, '456') }),
            ]
        )
    },
    setup() {
        return {
            msg: '我是msg信息'
        }
    }
}