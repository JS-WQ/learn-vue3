import { isObj } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Text } from "./vnode";

export function createRenderer(options: any) {
  const { createElement, patchProp, insert } = options;

  //vnode:虚拟节点;container:真实挂载节点
  function render(vnode: any, container: any, parentComponent: any) {
    patch(vnode, container, parentComponent);
  }

  function patch(vnode: any, container: any, parentComponent: any) {
    const { shapeFlag, type } = vnode;

    switch (type) {
      case "Fragment":
        //此时不会渲染标签节点，只会渲染children节点
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        //渲染文本节点：当children数组中包含文本节点的时候
        processText(vnode, container);
        break;
      default:
        //二进制“&”运算符可以判断是否属于
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
        }
        break;
    }
  }

  /**** =====处理vnode是component的情况 ========*/
  //处理组件信息
  function processComponent(vnode: any, container: any, parentComponent: any) {
    mountComponent(vnode, container, parentComponent);
  }
  //创建组件
  function mountComponent(vnode: any, container: any, parentComponent: any) {
    //首先创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);
    //初始化组件信息
    setupComponent(instance);
    //调用render,生成组件vnode
    setupRenderEffect(instance, vnode, container);
  }
  function setupRenderEffect(instance: any, vnode: any, container: any) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container, instance);
    vnode.el = subTree.el;
  }
  //更新组件
  function updateComponent() {}

  /**** =====处理vnode是element的情况 ========*/
  //处理元素节点信息
  function processElement(vnode: any, container: any, parentComponent: any) {
    mountElement(vnode, container, parentComponent);
  }
  //创建element
  function mountElement(vnode: any, container: any, parentComponent: any) {
    const { type, props, children, shapeFlag } = vnode;
    let el = (vnode.el = createElement(type));

    for (const key in props) {
      
      patchProp(el, key, props[key]);
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      //如果children是数组
      mountChildren(vnode, el, parentComponent);
    }
    // container.append(el);
    insert(el, container);
  }

  function mountChildren(vnode: any, container: any, parentComponent: any) {
    vnode.children.forEach((child: any) => {
      patch(child, container, parentComponent);
    });
  }
  //更新element
  function patchElement() {}

  // ====处理type为Fragment时只渲染children的情况======
  function processFragment(vnode: any, container: any, parentComponent: any) {
    mountChildren(vnode, container, parentComponent);
  }
  // ==== 处理type为Text的时候（children数组中有文本节点）===
  function processText(vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  return {
    createApp: createAppAPI(render),
  };
}
