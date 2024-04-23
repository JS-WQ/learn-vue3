import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
export const App = {
    name: "App",
    render() {
        window.self = this;
        return h(
            "Fragment", {},
            [h('p', {}, "我是span1"), h('p', {}, "我是span2"), createTextVNode('我是text文本')]
        )
    },
    setup() {
        return {
            msg: '我是msg信息'
        }
    }
}