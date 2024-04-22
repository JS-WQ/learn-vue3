'use strict';

function isObj(data) {
    return typeof data === 'object' && data !== null;
}

const targetMap = new Map(); //存放所有target的容器
function trigger(target, key) {
    //依赖触发：根据target和key找到dep
    //dep中存放了收集的_effect，遍历dep,执行_effect.run,那么effec函数便会再次被执行
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const _effect of dep) {
        if (_effect.scheduler) {
            _effect.scheduler();
        }
        else {
            _effect.run();
        }
    }
}

function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        if (isShallow) {
            return res;
        }
        if (isObj(res)) {
            //处理嵌套的问题，使得target的每一层都经过了代理处理
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, newValue) {
        const res = Reflect.set(target, key, newValue);
        //依赖触发
        trigger(target, key);
        return res;
    };
}
const get = createGetter();
const set = createSetter();
const mutableHandlers = {
    get: get,
    set: set,
};
const readonlyGet = createGetter(true);
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, newValue) {
        console.warn(`key:${key}是只读属性，无法被修改`);
        return true;
    },
};

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    //只读响应式数据：无法被修改，所以不需要进行依赖收集
    return createActiveObject(raw, readonlyHandlers);
}
function createActiveObject(raw, handlers) {
    return new Proxy(raw, handlers);
}

class RefImpl {
    constructor(value) {
        this._rawValue = value;
        this._value = isObj(value) ? reactive(value) : value;
        this.dep = new Set();
        this.__v_isRef = true;
    }
    get value() {
        return this._value;
    }
    set value(newVal) {
        //依赖触发
        if (!Object.is(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = isObj(newVal) ? reactive(newVal) : newVal;
            triggerEffects(this.dep);
        }
    }
}
function ref(raw) {
    return new RefImpl(raw);
}
function isRef(raw) {
    return !!raw.__v_isRef;
}
function unRef(raw) {
    return isRef(raw) ? raw.value : raw;
}
function proxyRefs(raw) {
    //作用：获取属性值的时候不需要用.value;
    return new Proxy(raw, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newVal) {
            if (isRef(target[key]) && !isRef(newVal)) {
                //如果原来是ref类型，新的值是普通类型
                return (target[key].value = newVal);
            }
            else {
                return Reflect.set(target, key, newVal);
            }
        },
    });
}

function createVNode(type, props, children) {
    //在初始化createApp的时候，type就等于rootComponent
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

//创建组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode, //组件的虚拟节点信息
        type: vnode.type, //如果是processComponent，此时的type就是component信息
    };
    return component;
}
//初始化组件信息
function setupComponent(instance) {
    //初始化组件的props
    //初始化组件的slots
    //初始化有状态的组件信息（组件的返回值，或者说是setup函数的返回值）
    setupStatefulComponent(instance);
}
//初始化有状态的组件信息(setup的返回值)
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
//处理setup函数返回值
function handleSetupResult(instance, setupResult) {
    //setupResult的值如果是对象，那么就需要把这个值放入上下文中提供组件使用；
    //setupResult的值如果是函数，那就把这个返回的函数当成是render函数；
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
//处理render渲染函数
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}

/**
 * vnode:虚拟节点
 * container:真实挂载节点
 * ***/
function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (isObj(vnode.type)) {
        processComponent(vnode, container);
    }
    else if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
}
/**** =====处理vnode是component的情况 ========*/
//处理组件信息
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
//创建组件
function mountComponent(vnode, container) {
    //首先创建组件实例
    const instance = createComponentInstance(vnode);
    //初始化组件信息
    setupComponent(instance);
    //调用render,生成组件vnode
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}
/**** =====处理vnode是element的情况 ========*/
//处理元素节点信息
function processElement(vnode, container) {
    mountElement(vnode, container);
}
//创建element
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    let el = document.createElement(type);
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        children.forEach((child) => {
            patch(child, el);
        });
    }
    container.append(el);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            //此时所有的操作都是基于vnode,所有需要先转换成vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}
/**
 * vue初始化函数基本调用路线：
 * 1. createApp
 * 2. createVNode(rootComponent):创建root的vnode，此时的vnode保存的是App这个对象
 * 3. render(vnode, rootContainer)
 * 4. patch(vnode, container):对vnode.type进行分析:是组件vnode还是elment节点vnode,对应不同的处理函数
 * 5. 如果是组件：processComponent(vnode: any, container: any):对组件vnode进行分析,是更新组件（待实现）还是渲染组件
 * 6. mountComponent(vnode, container):执行函数，调用里面的方法
 * 7. createComponentInstance(vnode):创建组件的instance实例，里面保存有组件的各种信息
 * 8. setupComponent(instance):根据instance实例，调用里面的函数，初始化组件的各种信息
 * 9. setupStatefulComponent(instance):初始化有状态的组件信息（组件的返回值，或者说是获取setup函数的返回值）
 * 10.finishComponentSetup(instance):处理实例的渲染函数，把组件的render绑定到instance实例的render中，方便调用
 * 11.setupRenderEffect(instance, container):调用instance.render,然后执行h函数(App.render(){return h(...)})
 * 12.patch(vnode,container):此时的vnode是h函数的返回值，根据vnode类型调用不同的处理函数，如果是组件vnode,则继续走5
 * **/

exports.createApp = createApp;
exports.h = h;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
