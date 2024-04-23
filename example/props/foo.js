import { h } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
    name: "Foo",
    render() {
        return h("div",{},`hi, foo.props: ${this.count}`)
    },
    setup() {}
}