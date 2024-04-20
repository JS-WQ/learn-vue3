class ReactiveEffect {
  private _fn: Function;
  deps = [];
  scheduler: any;
  onStop: any;
  isStoped: boolean;
  constructor(fn: Function, scheduler?: any, onStop?: any) {
    this._fn = fn;
    this.scheduler = scheduler;
    this.onStop = onStop;
    this.isStoped = false;
  }
  run() {
    activeEffect = this;
    let res = this._fn();
    return res;
  }
  stop() {
    //删除dep中保存的this(_effect),这样当依赖触发的时候，fn就不会被执行
    if (!this.isStoped) {
      //优化：默认没有被清除过，当清除一次后赋值为true;这样多次调用stop也只会执行一次。
      this.deps.forEach((dep: any) => {
        dep.delete(this);
      });
      this.onStop && this.onStop(); //当清理完成后如果有回调，就执行回调
      this.isStoped = true;
    }
  }
}

let activeEffect: any; //正在执行的effect
export function effect(fn: Function, options: any = {}) {
  //effect执行后会把fn返回出去

  /**
   * scheduler作用：当effect带有scheduler的时候,第一次默认会执行run;
   * 当响应式对象更新后，不会再次执行run,而是会执行scheduler;
   */

  /**
   * onStop作用：当stop(runner)执行后，便会触发onStop;
   * **/

  const scheduler = options.scheduler;
  const onStop = options.onStop;
  const _effect = new ReactiveEffect(fn, scheduler, onStop);
  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner._effect = _effect;

  return runner;
}

const targetMap = new Map(); //存放所有target的容器
export function track(target: any, key: any) {
  //依赖收集：其实就是收集 "_effect"
  //target => key => dep(存放_effect)

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  //当activeEffect存在的时候，说明此时正处于effect函数执行阶段，dep就需要收集_effect
  //同时effect也需要收集dep
  activeEffect && dep.add(activeEffect) && activeEffect.deps.push(dep);
}

export function trigger(target: any, key: any) {
  //依赖触发：根据target和key找到dep
  //dep中存放了收集的_effect，遍历dep,执行_effect.run,那么effec函数便会再次被执行

  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  for (const _effect of dep) {
    if (_effect.scheduler) {
      _effect.scheduler();
    } else {
      _effect.run();
    }
  }
}

export function stop(runner: any) {
  //调用stop函数，可以实现当依赖触发的时候不再执行runner（_effect.run.bind(_effect)）
  runner._effect.stop();
}
