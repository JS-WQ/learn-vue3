import {createRenderer} from "../../lib/guide-mini-vue.esm.js"
import { App } from "./app.js"
const renderer = createRenderer({
    createElement(type){
        let el = document.createElement('h3')
        el.textContent = '我是H3'
        return el
    },
    pathProp(el,key,value){
        el[key] = value
    },
    insert(el,parent){
        parent.append(el)
    }
})

const rootContainer = document.querySelector("#app")

renderer.createApp(App).mount(rootContainer)