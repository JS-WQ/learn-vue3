import { createRenderer } from "../runtime-core";

function createElement(type: string) {
  return document.createElement(type);
}
function patchProp(el: any, key: any, prevProp: any, nextProp: any) {
  const isOn = (key: string) => /^on[A-Z]/.test(key); //判断是否以on开头并且第三个字母是大写的
  if (isOn(key)) {
    //绑定事件
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextProp);
  } else {
    if (nextProp === undefined || nextProp === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextProp);
    }
  }
}

function insert(el: any, container: any) {
  container.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

export function createApp(...args: any[]) {
  return renderer.createApp(...args);
}
export * from "../runtime-core";
