import { h } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
    name: "Foo",
    render() {
        const btn = h('button', { onClick: this.emitAdd }, 'CLICK ADD')
        const foo = h('span', {}, 'hi,I foo')
        return h("div", {}, [foo, btn])
    },
    setup(props,{emit}) {
        const emitAdd = () => { 
            console.log('emit click');
            emit('add',1,2)
            emit('add-foo',1,2)
        }
        return {
            emitAdd
        }
    }
}