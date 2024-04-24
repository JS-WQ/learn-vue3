import { effect } from "../reactivity/effect";
import { isObj } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Text } from "./vnode";

export function createRenderer(options: any) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;

  //vnode:虚拟节点;container:真实挂载节点
  function render(vnode: any, container: any, parentComponent: any) {
    patch(null, vnode, container, parentComponent);
  }

  function patch(
    oldVnode: any,
    vnode: any,
    container: any,
    parentComponent: any
  ) {
    const { shapeFlag, type } = vnode;

    switch (type) {
      case "Fragment":
        //此时不会渲染标签节点，只会渲染children节点
        processFragment(oldVnode, vnode, container, parentComponent);
        break;
      case Text:
        //渲染文本节点：当children数组中包含文本节点的时候
        processText(oldVnode, vnode, container);
        break;
      default:
        //二进制“&”运算符可以判断是否属于
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(oldVnode, vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVnode, vnode, container, parentComponent);
        }
        break;
    }
  }

  /**** =====处理vnode是component的情况 ========*/
  //处理组件信息
  function processComponent(
    oldVnode: any,
    vnode: any,
    container: any,
    parentComponent: any
  ) {
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
    effect(() => {
      if (!instance.isMounted) {
        //组件初始化
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        )); //保存组件的vnode
        patch(null, subTree, container, instance);
        vnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        //组件更新

        const subTree = instance.render.call(instance.proxy); //保存组件的vnode
        const prevSubTree = instance.subTree; //获取组件上一次的vnode
        instance.subTree = subTree;

        patch(prevSubTree, subTree, container, instance);
        vnode.el = subTree.el;
      }
    });
  }
  //更新组件
  function updateComponent() {}

  /**** =====处理vnode是element的情况 ========*/
  //处理元素节点信息
  function processElement(
    oldVnode: any,
    vnode: any,
    container: any,
    parentComponent: any
  ) {
    if (!oldVnode) {
      mountElement(vnode, container, parentComponent);
    } else {
      patchElement(oldVnode, vnode, container, parentComponent);
    }
  }
  //创建element
  function mountElement(vnode: any, container: any, parentComponent: any) {
    const { type, props, children, shapeFlag } = vnode;
    let el = (vnode.el = hostCreateElement(type));

    for (const key in props) {
      hostPatchProp(el, key, null, props[key]);
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      //如果children是数组
      mountChildren(vnode, el, parentComponent);
    }
    // container.append(el);
    hostInsert(el, container);
  }

  function mountChildren(vnode: any, container: any, parentComponent: any) {
    vnode.children.forEach((child: any) => {
      patch(null, child, container, parentComponent);
    });
  }
  //更新element
  function patchElement(
    oldVnode: any,
    vnode: any,
    container: any,
    parentComponent: any
  ) {
    const el = (vnode.el = oldVnode.el);
    const oldProps = oldVnode.props || {};
    const newProps = vnode.props || {};
    //更新props
    patchProps(el, oldProps, newProps);
  }

  //更新element props
  function patchProps(el: any, oldProps: any, newProps: any) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        //遍历新的props对比不同
        let prevProp = oldProps[key];
        let nextProp = newProps[key];
        if (prevProp !== newProps) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }
      for (const key in oldProps) {
        //遍历老的，找出新的不存在的属性，然后删除
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }

  // ====处理type为Fragment时只渲染children的情况======
  function processFragment(
    oldVnode: any,
    vnode: any,
    container: any,
    parentComponent: any
  ) {
    mountChildren(vnode, container, parentComponent);
  }
  // ==== 处理type为Text的时候（children数组中有文本节点）===
  function processText(oldVnode: any, vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  return {
    createApp: createAppAPI(render),
  };
}
