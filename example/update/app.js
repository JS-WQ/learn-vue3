import { h, ref } from '../../lib/guide-mini-vue.esm.js'

export const App = {
    name: "App",
    render() {
        return h(
            "div",
            {
                id: "root",
                foo: this.props.foo,
                bar: this.props.bar,

            },
            [
                h("div", {}, "count:" + this.count),
                h("button", { onClick: this.onClick }, "click"),
                h("button", { onClick: this.onChangePropsDemo1 }, "修改属性 click"),
                h("button", { onClick: this.onChangePropsDemo2 }, "删除属性 click"),
                h("button", { onClick: this.onChangePropsDemo3 }, "整个替换 click"),
            ]
        )
    },
    setup() {
        const count = ref(0)
        const onClick = () => {
            count.value++;
        }
        const props = ref({
            foo: "foo",
            bar: "bar"
        })
        const onChangePropsDemo1 = () => {
            props.value.foo = "new-foo"
        }
        const onChangePropsDemo2 = () => {
            props.value.foo = undefined
        }
        const onChangePropsDemo3 = () => {
            props.value = {
                foo: "foo"
            }
        }
        return {
            count,
            onClick,
            props,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3
        }
    }
}