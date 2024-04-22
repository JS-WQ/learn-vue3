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
  if (isObj(vnode.type)) {
    processComponent(vnode, container);
  } else if (typeof vnode.type === "string") {
    processElement(vnode, container);
  }
}

/**** =====处理vnode是component的情况 ========*/
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

/**** =====处理vnode是element的情况 ========*/
//处理元素节点信息
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
//创建element
function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode;
  let el = document.createElement(type);

  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    //如果children是数组
    mountChildren(vnode,el)
  }
  container.append(el);
}

function mountChildren(vnode: any, container: any) {
  vnode.children.forEach((child: any) => {
    patch(child, container);
  });
}
//更新element
function patchElement() {}
