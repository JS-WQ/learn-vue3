import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

//创建组件实例
export function createComponentInstance(vnode: any) {
  const component = {
    vnode, //组件的虚拟节点信息
    type: vnode.type, //如果是processComponent，此时的type就是component信息
    setupState: {}, //存放setup的返回值
    props: {}, //存放组件的props
    slots: {}, //存放组件的slots
    emit: (key: string) => {}, //emit调用函数
  };
  component.emit = emit.bind(null,component);
  return component;
}

//初始化组件信息
export function setupComponent(instance: any) {
  //初始化组件的props
  initProps(instance, instance.vnode.props);
  //初始化组件的slots
  initSlots(instance,instance.vnode.children)
  //初始化有状态的组件信息（组件的返回值，或者说是setup函数的返回值）
  setupStatefulComponent(instance);
}

//初始化有状态的组件信息(setup的返回值)
function setupStatefulComponent(instance: any) {
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const component = instance.type;
  const { setup } = component;

  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    }); //用shallowReadonly包裹props,实现只读功能
    handleSetupResult(instance, setupResult);
  }
}

//处理setup函数返回值
function handleSetupResult(instance: any, setupResult: any) {
  //setupResult的值如果是对象，那么就需要把这个值放入上下文中提供组件使用；
  //setupResult的值如果是函数，那就把这个返回的函数当成是render函数；
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  } else if (typeof setupResult === "function") {
  }
  finishComponentSetup(instance);
}
//处理render渲染函数
function finishComponentSetup(instance: any) {
  const component = instance.type;
  if (component.render) {
    instance.render = component.render;
  }
}
