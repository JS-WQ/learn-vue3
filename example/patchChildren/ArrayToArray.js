import { h, ref } from '../../lib/guide-mini-vue.esm.js'

//左侧对比
// const prevChildren = [
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),
//     h("div", { key: "D" }, "D"),
//     h("div", { key: "E" }, "E")]
// const nextChildren = [
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),
//     h("div", { key: "C" }, "C"),
//     h("div", { key: "D" }, "D")]


//右侧对比
// const prevChildren = [
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),
//     h("div", { key: "C" }, "C"),]
// const nextChildren = [
//     h("div", { key: "D" }, "D"),
//     h("div", { key: "E" }, "E"),
//     h("div", { key: "B" }, "B"),
//     h("div", { key: "C" }, "C"),
// ]

//新的比老的长
// const prevChildren = [
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),
// ]
// const nextChildren = [
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),
//     h("div", { key: "C" }, "C"),
//     h("div", { key: "D" }, "D"),
// ]

//新的比老的长
// const prevChildren = [
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),
// ]
// const nextChildren = [
//     h("div", { key: "C" }, "C"),
//     h("div", { key: "D" }, "D"),
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),
// ]
//老的比新的长
// const prevChildren = [
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),
//     h("div", { key: "C" }, "C"),
//     h("div", { key: "D" }, "D"),
// ]
// const nextChildren = [
//     h("div", { key: "A" }, "A"),
//     h("div", { key: "B" }, "B"),

// ]
//复杂数据:对比中间部分
const prevChildren = [
    h("div", { key: "A" }, "A"),
    h("div", { key: "B" }, "B"),
    h("div", { key: "C" }, "C"),
    h("div", { key: "D" }, "D"),
    h("div", { key: "E" }, "E"),
    h("div", { key: "Z" }, "Z"),
    h("div", { key: "F" }, "F"),
    h("div", { key: "G" }, "G"),
]
const nextChildren = [
    h("div", { key: "A" }, "A"),
    h("div", { key: "B" }, "B"),
    h("div", { key: "D" }, "D"),
    h("div", { key: "C" }, "C"),
    h("div", { key: "Y" }, "Y"),
    h("div", { key: "E" }, "E"),
    h("div", { key: "F" }, "F"),
    h("div", { key: "G" }, "G"),

]
//i:1 e1:3 e2:3
export default {
    name: "ArrayToArray",
    setup() {
        const isChange = ref(false)
        window.isChange = isChange;
        return { isChange }
    },
    render() {
        const self = this;

        return self.isChange ? h("div", {}, nextChildren) : h("div", {}, prevChildren)
    }
}