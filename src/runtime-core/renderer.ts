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
    remove: hostRmove,
    setElementText: hostSetElementText,
  } = options;

  //vnode:虚拟节点;container:真实挂载节点
  function render(vnode: any, container: any, parentComponent: any) {
    patch(null, vnode, container, parentComponent, null);
  }

  function patch(
    oldVnode: any,
    vnode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const { shapeFlag, type } = vnode;

    switch (type) {
      case "Fragment":
        //此时不会渲染标签节点，只会渲染children节点
        processFragment(oldVnode, vnode, container, parentComponent, anchor);
        break;
      case Text:
        //渲染文本节点：当children数组中包含文本节点的时候
        processText(oldVnode, vnode, container);
        break;
      default:
        //二进制“&”运算符可以判断是否属于
        if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(oldVnode, vnode, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVnode, vnode, container, parentComponent, anchor);
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
    parentComponent: any,
    anchor: any
  ) {
    mountComponent(vnode, container, parentComponent, anchor);
  }
  //创建组件
  function mountComponent(
    vnode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    //首先创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);
    //初始化组件信息
    setupComponent(instance);
    //调用render,生成组件vnode
    setupRenderEffect(instance, vnode, container, anchor);
  }
  function setupRenderEffect(
    instance: any,
    vnode: any,
    container: any,
    anchor: any
  ) {
    effect(() => {
      if (!instance.isMounted) {
        //组件初始化
        const subTree = (instance.subTree = instance.render.call(
          instance.proxy
        )); //保存组件的vnode
        patch(null, subTree, container, instance, anchor);
        vnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        //组件更新

        const subTree = instance.render.call(instance.proxy); //保存组件的vnode
        const prevSubTree = instance.subTree; //获取组件上一次的vnode
        instance.subTree = subTree;

        patch(prevSubTree, subTree, container, instance, anchor);
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
    parentComponent: any,
    anchor: any
  ) {
    if (!oldVnode) {
      mountElement(vnode, container, parentComponent, anchor);
    } else {
      patchElement(oldVnode, vnode, container, parentComponent, anchor);
    }
  }
  //创建element
  function mountElement(
    vnode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const { type, props, children, shapeFlag } = vnode;
    let el = (vnode.el = hostCreateElement(type));

    for (const key in props) {
      hostPatchProp(el, key, null, props[key]);
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      //如果children是数组
      mountChildren(vnode.children, el, parentComponent, anchor);
    }
    hostInsert(el, container, anchor);
  }

  function mountChildren(
    children: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    children.forEach((child: any) => {
      patch(null, child, container, parentComponent, anchor);
    });
  }
  //更新element
  function patchElement(
    oldVnode: any,
    vnode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const el = (vnode.el = oldVnode.el);
    const oldProps = oldVnode.props || {};
    const newProps = vnode.props || {};
    //更新children
    patchChildren(el, oldVnode, vnode, parentComponent, anchor);
    //更新props
    patchProps(el, oldProps, newProps);
  }

  function unmountedChildren(children: any[]) {
    for (let index = 0; index < children.length; index++) {
      let el = children[index].el;
      hostRmove(el);
    }
  }

  //更新children，对比新旧节点
  function patchChildren(
    container: any,
    oldVnode: any,
    vnode: any,
    parentComponent: any,
    anchor: any
  ) {
    const oldShapFlag = oldVnode.shapeFlag;
    const newShapFlag = vnode.shapeFlag;
    if (newShapFlag & ShapeFlags.TEXT_CHILDREN) {
      //如果新节点是文本:老节点是文本或者数组
      if (oldShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        //如果老节点是数组：直接删除老节点，设置文本
        unmountedChildren(oldVnode.children);
      }
      if (oldVnode.children !== vnode.children) {
        hostSetElementText(container, vnode.children);
      }
    } else if (newShapFlag & ShapeFlags.ARRAY_CHILDREN) {
      //如果新节点是数组：
      if (oldShapFlag & ShapeFlags.TEXT_CHILDREN) {
        //如果老节点是文本：删除文本，把数组mount到节点上
        hostSetElementText(container, "");
        mountChildren(vnode.children, container, parentComponent, anchor);
      } else {
        //老节点也是数组：双端对比diff算法
        patchKeyedChildren(
          oldVnode.children,
          vnode.children,
          container,
          parentComponent,
          anchor
        );
      }
    }
  }

  function patchKeyedChildren(
    oldChildren: any,
    newChildren: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    let i = 0;
    let e1 = oldChildren.length - 1;
    let e2 = newChildren.length - 1;
    function isSameVnodeType(oldVnode: any, newVnode: any) {
      return oldVnode.type === newVnode.type && oldVnode.key === newVnode.key;
    }

    //1.首先进行左侧对比
    while (i <= e1 && i <= e2) {
      let oldChild = oldChildren[i];
      let newChild = newChildren[i];

      if (isSameVnodeType(oldChild, newChild)) {
        //如果节点相同，那么可能继续对比节点的子节点
        patch(oldChild, newChild, container, parentComponent, anchor);
      } else {
        break;
      }
      i++;
    }
    console.log(i);
    //2.其次进行右侧对比
    while (i <= e1 && i <= e2) {
      let oldChild = oldChildren[e1];
      let newChild = newChildren[e2];
      if (isSameVnodeType(oldChild, newChild)) {
        //如果节点相同，那么可能继续对比节点的子节点
        patch(oldChild, newChild, container, parentComponent, anchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    console.log(e1, "e1");
    console.log(e2, "e2");

    //3.如果旧的节点全部都已经对比成功;并且还有新的节点没有对比，则直接新建节点
    if (i > e1) {
      //旧的节点已经全部完成对比成功
      if (i <= e2) {
        //还剩下一部分新的节点没有对比,直接新建节点
        let nextPos = e2 + 1;
        let anchor =
          nextPos < newChildren.length ? newChildren[nextPos].el : null; //newChildren[nextPos].el保存的是oldChildren[]中的el
        while (i <= e2) {
          patch(null, newChildren[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      //4.新的节点比旧的节点少:新的节点都已经对比成功，还有老的节点存在，直接删除多余老的节点
      while (i <= e1) {
        hostRmove(oldChildren[i].el);
        i++;
      }
    } else {
      //5.乱序节点,中间对比
      let s1 = i;
      let s2 = i;
      const toBePatched = e2 - s2 + 1; //新节点上总共需要处理的数量
      let patched = 0; //新节点已经处理完的数量
      //如果patched等于toBePatched的时候，说明新节点都已经处理完成，没有处理完的旧节点都可以删除
      const keyToNewIndexMap = new Map(); //新节点上的关键字key和当前的下标
      for (let index = s2; index <= e2; index++) {
        //遍历新节点
        const newChild = newChildren[index];
        keyToNewIndexMap.set(newChild.key, index);
      }

      for (let index = s1; index <= e1; index++) {
        //遍历旧节点
        const oldChild = oldChildren[index];
        if (patched >= toBePatched) {
          hostRmove(oldChild.el);
          continue;
        }
        let newIndex;
        if (oldChild.key !== null && oldChild.key !== undefined) {
          //当key值存在的时候
          newIndex = keyToNewIndexMap.get(oldChild.key);
        } else {
          //当key值不存在的时候
          for (let j = s2; j <= e2; j++) {
            if (isSameVnodeType(oldChild, newChildren[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          //该节点不存在新的节点中，需要删除
          hostRmove(oldChild.el);
        } else {
          //该节点存在于新节点中
          patch(
            oldChild,
            newChildren[newIndex],
            container,
            parentComponent,
            anchor
          );
          patched++;
        }
      }
    }
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
    parentComponent: any,
    anchor: any
  ) {
    mountChildren(vnode.children, container, parentComponent, anchor);
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
