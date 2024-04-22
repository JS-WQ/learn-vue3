export function createVNode(type:any,props?:any,children?:any){
  //在初始化createApp的时候，type就等于rootComponent
  const vnode = {
    type,
    props,
    children,
  };
  return vnode;
}