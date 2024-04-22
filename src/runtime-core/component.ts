//创建组件实例
export function createComponentInstance(vnode: any) {
  const component = {
    vnode, //组件的虚拟节点信息
    type: vnode.type, //如果是processComponent，此时的type就是component信息
  };
  return component;
}

//初始化组件信息
export function setupComponent(instance: any) {
  //初始化组件的props
  //初始化组件的slots
  //初始化有状态的组件信息（组件的返回值，或者说是setup函数的返回值）
  setupStatefulComponent(instance);
}

//初始化有状态的组件信息(setup的返回值)
function setupStatefulComponent(instance: any) {
  const component = instance.type;
  const { setup } = component;
  if (setup) {
    const setupResult = setup();
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
    if(component.render){
        instance.render = component.render
    }
}
