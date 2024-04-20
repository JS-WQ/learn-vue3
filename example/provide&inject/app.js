import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'

const Provider = {
    name: "Provider",
    setup() {
        provide('foo', 'fooVal')
        provide('bar', 'barVal')
    },
    render() {
        return h("div", {}, [h("p", {}, "Provider"), h(Provider2)])
    }
}

const Provider2 = {
    name: "Provider2",
    setup() {
        provide('foo', 'foo2Val')
        const foo = inject("foo")
        return {
            foo
        }
    },
    render() {
        return h("div", {}, [h("p", {}, `Provider2 foo:${this.foo}`), h(Consumer)])
    }
}

const Consumer = {
    name: "Consumer",
    setup() {
        const foo = inject("foo");
        const bar = inject("bar");
        const baz = inject("baz","default baz")
        return {
            foo,
            bar,
            baz
        }
    },
    render() {
        return h("div", {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz}`)
    }
}

export const App = {
    name: "App",
    setup() { },
    render() {
        return h('div', {}, [h("p", {}, "provide&inject"), h(Provider)])
    }
}