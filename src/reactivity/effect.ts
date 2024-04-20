class ReactiveEffect {
  private _fn: Function;
  constructor(fn: Function) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    let res = this._fn();
    return res;
  }
}

let activeEffect: any; //正在执行的effect
export function effect(fn: Function) {
  //effect执行后会把fn返回出去
  const _effect = new ReactiveEffect(fn);
  _effect.run();
  return _effect.run.bind(_effect);
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
  activeEffect && dep.add(activeEffect);
}

export function trigger(target: any, key: any) {
  //依赖触发：根据target和key找到dep
  //dep中存放了收集的_effect，遍历dep,执行_effec.run,那么effec函数便会再次被执行

  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  for (const _effect of dep) {
    _effect.run();
  }
}
