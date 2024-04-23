import { ShapeFlags } from "../shared/ShapeFlags";

//初始化组件的slots
export function initSlots(instance: any, children: any) {
  const { vnode } = instance;
  let slots: any = {};
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    for (let key in children) {
      let value: any = children[key];
      slots[key] = (props: any) => {
        return Array.isArray(value(props)) ? value(props) : [value(props)];
      };
    }
    instance.slots = slots;
  }
}
