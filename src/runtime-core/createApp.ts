import { createVNode } from "./vnode";

export function createAppAPI(render: Function) {
  return function createApp(rootComponent: any) {
    return {
      mount(rootContainer: any) {
        //此时所有的操作都是基于vnode,所有需要先转换成vnode
        const vnode = createVNode(rootComponent);
        render(vnode, rootContainer, null);
      },
    };
  };
}

/****
 * 使用createAppAPI是基于自定义渲染的需求来处理的：通过runtime-dom中的index.ts自定义的渲染函数来完成
 */

/**
 * vue初始化函数基本调用路线：
 * 1. createApp
 * 2. createVNode(rootComponent):创建root的vnode，此时的vnode保存的是App这个对象
 * 3. render(vnode, rootContainer)
 * 4. patch(vnode, container):对vnode.type进行分析:是组件vnode还是elment节点vnode,对应不同的处理函数
 * 5. 如果是组件：processComponent(vnode: any, container: any):对组件vnode进行分析,是更新组件（待实现）还是渲染组件
 * 6. mountComponent(vnode, container):执行函数，调用里面的方法
 * 7. createComponentInstance(vnode):创建组件的instance实例，里面保存有组件的各种信息
 * 8. setupComponent(instance):根据instance实例，调用里面的函数，初始化组件的各种信息
 * 9. setupStatefulComponent(instance):初始化有状态的组件信息（组件的返回值，或者说是获取setup函数的返回值）
 * 10.finishComponentSetup(instance):处理实例的渲染函数，把组件的render绑定到instance实例的render中，方便调用
 * 11.setupRenderEffect(instance, container):调用instance.render,然后执行h函数(App.render(){return h(...)})
 * 12.patch(vnode,container):此时的vnode是h函数的返回值，根据vnode类型调用不同的处理函数，如果是组件vnode,则继续走5
 * **/
