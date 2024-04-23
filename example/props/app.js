import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './foo.js';
export const App = {
    name: "App",
    render() {
        window.self = this;
        return h("div", {},
            [
                h('p', {}, `App.msg: ${this.msg}`),
                h(Foo, { count: 1 }),
            ]
        )
    },
    setup() {
        return {
            msg: '我是msg信息'
        }
    }
}