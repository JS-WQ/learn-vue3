import { h } from '../../lib/guide-mini-vue.esm.js'
export const App = {
    name: "App",
    render() {
        
        return h("div", {}, '我是div')
    },
    setup() {
        return {
            msg: '我是msg信息'
        }
    }
}