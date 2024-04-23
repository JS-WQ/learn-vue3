import { getCurrentInstance } from "./component";

export function provide(key: string, value: any) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;

    if (provides === parentProvides) {
      //第一次初始化的时候，当前的provides会等于父级的provides
      //避免多次调用的时候，重复初始化
      provides = currentInstance.provides = Object.create(parentProvides); //原型链
    }
    provides[key] = value;
  }
}
export function inject(key: string, defaultVal: any) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultVal) {
      return typeof defaultVal === "function" ? defaultVal() : defaultVal;
    }
  }
}
