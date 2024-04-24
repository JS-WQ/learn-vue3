import { isObj } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";

export const Text = Symbol("text");

export function createVNode(type: any, props?: any, children?: any) {
  //在初始化createApp的时候，type就等于rootComponent
  const vnode = {
    type,
    props,
    children,
    el: null,
    key: props?.key,
    shapeFlag: getShapeFlag(type), //获取vnode的类型
  };
  //设置children的类型:数组或字符串
  if (typeof children === "string") {
    //二进制位运算通过 “|” 能设置值
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }
  //判断children是否为slots:1.vnode是组件类型；2.children是对象
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObj(children)) {
      vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}
function getShapeFlag(type: any) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
