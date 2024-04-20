import { ReactiveEffect } from "./effect";

/****
 * 基本原理:利用ReactiveEffect的schduler函数，当computed里面的依赖项修改，都会触发依赖；
 * 此时会调用schduler函数，把lazy改成false;当获取computed值的时候，再根据lazy进行判断，
 * 是否重新执行run,还是直接返回上一次的值；这就是计算属性的缓存原因；
 * 
 */

class ComputedRefImpl {
  private _fn: Function;
  private _value: any;
  private _lazy: boolean;
  private _effect: ReactiveEffect;
  constructor(fn: Function) {
    this._fn = fn;
    this._value = null;
    this._lazy = false;
    this._effect = new ReactiveEffect(this._fn, () => {
      //scheduler
      this._lazy = false;
    });
  }
  get value() {
    if(!this._lazy){
        this._value = this._effect.run()
        this._lazy = true
    }
    return this._value;
  }
}

export function computed(fn: Function) {
  return new ComputedRefImpl(fn);
}
