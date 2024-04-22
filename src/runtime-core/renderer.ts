import { isObj } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

/**
 * vnode:虚拟节点
 * container:真实挂载节点
 * ***/
export function render(vnode: any, container: any) {
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  if (isObj(vnode.type)){
    processComponent(vnode, container);
  }else{
    
  } 
}

//处理组件信息
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

//创建组件
function mountComponent(vnode: any, container: any) {
  //首先创建组件实例
  const instance = createComponentInstance(vnode);
  //初始化组件信息
  setupComponent(instance);
  //调用render,生成组件vnode
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render();
  patch(subTree, container);
}

//更新组件
function updateComponent() {}

//元素节点
function processElement() {
  //处理元素节点信息
}
function mountElement() {}
function patchElement() {}
