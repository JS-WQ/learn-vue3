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

function remove(child: any) {
  let parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}
function setElementText(el: any, text: any) {
  //设置文本子节点
  el.textContent = text;
}
const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...args: any[]) {
  return renderer.createApp(...args);
}
export * from "../runtime-core";
