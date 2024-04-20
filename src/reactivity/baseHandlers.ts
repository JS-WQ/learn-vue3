import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";

function createGetter(isReadonly: boolean = false) {
  return function get(target: any, key: any) {
    const res = Reflect.get(target, key);
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    if (!isReadonly) {
      //如果不是只读的，那么就需要依赖收集
      track(target, key);
    }
    if (typeof res === "object" && res !== null) {
      //处理嵌套的问题，使得target的每一层都经过了代理处理
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
}

function createSetter() {
  return function set(target: any, key: any, newValue: any) {
    const res = Reflect.set(target, key, newValue);
    //依赖触发
    trigger(target, key);
    return res;
  };
}

const get = createGetter();
const set = createSetter();
export const mutableHandlers = {
  get: get,
  set: set,
};

const readonlyGet = createGetter(true);
export const readonlyHandlers = {
  get: readonlyGet,
  set(target: any, key: any, newValue: any) {
    console.warn(`key:${key}是只读属性，无法被修改`);
    return true;
  },
};
