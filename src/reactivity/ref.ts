import { isObj } from "../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  dep: Set<unknown>;
  private _rawValue: any;
  private __v_isRef: boolean;
  constructor(value: any) {
    this._rawValue = value;
    this._value = isObj(value) ? reactive(value) : value;
    this.dep = new Set();
    this.__v_isRef = true;
  }
  get value() {
    //进行依赖收集
    if (isTracking()) {
      trackEffects(this.dep);
    }
    return this._value;
  }
  set value(newVal) {
    //依赖触发
    if (!Object.is(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = isObj(newVal) ? reactive(newVal) : newVal;
      triggerEffects(this.dep);
    }
  }
}
export function ref(raw: any) {
  return new RefImpl(raw);
}
export function isRef(raw: any) {
  return !!raw.__v_isRef;
}
export function unRef(raw: any) {
  return isRef(raw) ? raw.value : raw;
}
export function proxyRefs(raw: any) {
    //作用：获取属性值的时候不需要用.value;
  return new Proxy(raw, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, newVal) {
      if (isRef(target[key]) && !isRef(newVal)) {
        //如果原来是ref类型，新的值是普通类型
        return (target[key].value = newVal);
      } else {
        return Reflect.set(target, key, newVal);
      }
    },
  });
}
