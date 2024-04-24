import { h, ref } from '../../lib/guide-mini-vue.esm.js'

import ArrayToText from './ArrayToTex.js'
import TextToTex from './TextToTex.js'
import TextToArrayy from './TextToArrayy.js'
import ArrayToArray from './ArrayToArray.js'


export const App = {
    name: "App",
    render() {
        return h(
            "div",
            {tId:1},
            [
                h("p",{},"主页"),
                h(TextToArrayy),
                // h(ArrayToText),
                // h(TextToTex),
                // h(ArrayToArray)
            ]
        )
    },
    setup(){}
}