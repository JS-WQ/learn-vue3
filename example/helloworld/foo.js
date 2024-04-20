import { h } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
    name: "Foo",
    setup(props, { emit }) {
        return {}
    },
    render() {
        console.log(this.$slots);
        const foo = h("span", {}, "foo")
        return h('div', {}, [foo,this.$slots])
    }
}