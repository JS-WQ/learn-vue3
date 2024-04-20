import { track, trigger } from "./effect";
import { mutableHandlers, readonlyHandlers } from "./baseHandlers";


export function reactive(raw: any) {
  return createActiveObject(raw,mutableHandlers)
}

export function readonly(raw: any) {
  //只读响应式数据：无法被修改，所以不需要进行依赖收集
  return createActiveObject(raw, readonlyHandlers);
}

function createActiveObject(raw:any,handlers:any){
    return new Proxy(raw,handlers)
}