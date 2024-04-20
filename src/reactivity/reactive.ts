import { track, trigger } from "./effect";
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw: any) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw: any) {
  //只读响应式数据：无法被修改，所以不需要进行依赖收集
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw: any) {
  //浅层只读响应式数据
  return createActiveObject(raw, shallowReadonlyHandlers);
}

function createActiveObject(raw: any, handlers: any) {
  return new Proxy(raw, handlers);
}

export function isReactive(value: any) {
  //思路：读取一个特定的值，如果能进入proxy，再get(proxy)中对这个特定值进行判断；如果进不了，则直接返回false
  return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(value: any) {
  //思路：读取一个特定的值，如果能进入proxy，再get(proxy)中对这个特定值进行判断；如果进不了，则直接返回false
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value:any){
    return isReactive(value) || isReadonly(value)
}