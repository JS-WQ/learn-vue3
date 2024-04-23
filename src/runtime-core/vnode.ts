import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type: any, props?: any, children?: any) {
  //在初始化createApp的时候，type就等于rootComponent
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type), //获取vnode的类型
  };
  //设置children的类型
  if(typeof children === 'string'){
    //二进制位运算通过 “|” 能设置值
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  }else if(Array.isArray(children)){
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }
  return vnode;
}

function getShapeFlag(type: any) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
