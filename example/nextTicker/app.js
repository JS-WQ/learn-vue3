import { getCurrentInstance, h, nextTick, ref } from '../../lib/guide-mini-vue.esm.js'
export const App = {
    name: "App",
    render() {
        const button = h('button', { onClick: this.clickFn }, 'update');
        const p = h("p", {}, `count:${this.count}`)

        return h('div', {}, [button, p])
    },
    setup() {
        const count = ref(1)
        const instance = getCurrentInstance()
        function clickFn() {
            for (let i = 0; i < 4; i++) {
                count.value = i;
            }
            console.log(instance);
            nextTick(()=>{
                console.log('nextTick');
                console.log(instance);
            })
        }
        return {
            count,
            clickFn
        }
    }
}

