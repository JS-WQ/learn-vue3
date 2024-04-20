import { isObj } from "../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  dep: Set<unknown>;
    private _rawValue: any;
  constructor(value: any) {
    this._rawValue= value;
    this._value = isObj(value) ? reactive(value) : value;
    this.dep = new Set();
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