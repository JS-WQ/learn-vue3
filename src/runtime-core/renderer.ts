import { isObj } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

/**
 * vnode:虚拟节点
 * container:真实挂载节点
 * ***/
export function render(vnode: any, container: any) {
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  const { shapeFlag } = vnode;
  //二进制“&”运算符可以判断是否属于
  if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  } else if (shapeFlag & ShapeFlags.ELEMENT) {
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
  setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance: any, vnode: any, container: any) {
  const subTree = instance.render.call(instance.proxy);
  patch(subTree, container);
  vnode.el = subTree.el;
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
  const { type, props, children, shapeFlag } = vnode;
  let el = (vnode.el = document.createElement(type));

  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    //如果children是数组
    mountChildren(vnode, el);
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
