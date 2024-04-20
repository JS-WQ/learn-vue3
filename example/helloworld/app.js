import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './foo.js';
export const App = {
    name: "App",
    render() {
        window.self = this;
        const foo = h("div", {}, "foo")
        const app = h("div", {}, "APP")
        return h("Fragment", {}, [app, foo, "我是文本信息"])
    },
    setup() {
        return {
            msg: '我是msg信息'
        }
    }
}