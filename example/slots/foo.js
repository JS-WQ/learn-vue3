import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
    name: "Foo",
    render() {
        console.log(this.$slots);
        const foo = h('div', {}, 'foo')
        const age = 18
        return h("div", {}, [renderSlots(this.$slots, 'header', {age}), foo, renderSlots(this.$slots, 'footer')])
    },
    setup() { }
}