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
    patch(vnode);
}
function patch(vnode, container) {
    processComponent(vnode);
}
//处理组件信息
function processComponent(vnode, container) {
    mountComponent(vnode);
}
//创建组件
function mountComponent(vnode, container) {
    //首先创建组件实例
    const instance = createComponentInstance(vnode);
    //初始化组件信息
    setupComponent(instance);
    //调用render,生成组件vnode
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            //此时所有的操作都是基于vnode,所有需要先转换成vnode
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

exports.createApp = createApp;
exports.h = h;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
