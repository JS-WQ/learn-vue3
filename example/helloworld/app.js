import { h } from '../../lib/guide-mini-vue.esm.js'
export const App = {
    name: "App",
    render() {
        window.self = this;
        return h(
            "div",
            {
                id: "boxId", class: ['box', 'active'], onClick: function () {
                    console.log('click handler')
                }
            },
            `hi, mini-vue: ${this.msg}`,
            // [
            //     h('p', {}, "我是p1"),
            //     h('p', {}, "我是p2"),
            // ]
        )
    },
    setup() {
        return {
            msg: '我是msg信息'
        }
    }
}