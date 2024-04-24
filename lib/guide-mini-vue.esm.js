function isObj(data) {
    return typeof data === 'object' && data !== null;
}
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

class ReactiveEffect {
    constructor(fn, scheduler, onStop) {
        this.deps = [];
        this._fn = fn;
        this.scheduler = scheduler;
        this.onStop = onStop;
        this.active = true;
    }
    run() {
        if (!this.active) {
            //如果经过了stop(runner),那么久不需要再次进行收集了
            return this._fn();
        }
        //函数this._fn执行前打开收集的指定；执行完毕后关上收集的指令；
        //同时抛出this._fn的返回值
        activeEffect = this;
        shouldTrack = true;
        const res = this._fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        //删除dep中保存的this(_effect),这样当依赖触发的时候，fn就不会被执行
        if (this.active) {
            //优化：默认没有被清除过，当清除一次后赋值为true;这样多次调用stop也只会执行一次。
            this.deps.forEach((dep) => {
                dep.delete(this);
            });
            this.deps.length = 0;
            this.onStop && this.onStop(); //当清理完成后如果有回调，就执行回调
            this.active = false;
        }
    }
}
let activeEffect; //正在执行的effect
let shouldTrack; //是否应该收集依赖
function effect(fn, options = {}) {
    //effect执行后会把fn返回出去
    /**
     * scheduler作用：当effect带有scheduler的时候,第一次默认会执行run;
     * 当响应式对象更新后，不会再次执行run,而是会执行scheduler;
     */
    /**
     * onStop作用：当stop(runner)执行后，便会触发onStop;
     * **/
    const scheduler = options.scheduler;
    const onStop = options.onStop;
    const _effect = new ReactiveEffect(fn, scheduler, onStop);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner._effect = _effect;
    return runner;
}
const targetMap = new Map(); //存放所有target的容器
function track(target, key) {
    //依赖收集：其实就是收集 "_effect"
    //target => key => dep(存放_effect)
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    //当activeEffect存在的时候，说明此时正处于effect函数执行阶段，dep就需要收集_effect
    //同时effect也需要收集dep
    trackEffects(dep);
}
function trackEffects(dep) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
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
        if (!isReadonly) {
            //如果不是只读的，那么就需要依赖收集
            track(target, key);
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
const shallowReadonlyGet = createGetter(true, true);
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
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
function shallowReadonly(raw) {
    //浅层只读响应式数据
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, handlers) {
    if (!isObj(raw)) {
        console.warn(`target: ${raw} 必须是对象！`);
        return raw;
    }
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
        //进行依赖收集
        if (isTracking()) {
            trackEffects(this.dep);
        }
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

const Text = Symbol('text');
function createVNode(type, props, children) {
    //在初始化createApp的时候，type就等于rootComponent
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type), //获取vnode的类型
    };
    //设置children的类型:数组或字符串
    if (typeof children === "string") {
        //二进制位运算通过 “|” 能设置值
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    //判断children是否为slots:1.vnode是组件类型；2.children是对象
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (isObj(children)) {
            vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode("div", {}, slot(props));
        }
    }
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const camelize = (str) => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toUpperCase() : "";
        });
    };
    const capitalize = (str) => {
        //首字母大写
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const toHandlerKey = (str) => {
        return str ? "on" + capitalize(str) : "";
    };
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

//初始化组件的props
function initProps(instance, props) {
    instance.props = props || {};
}

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            //如果key值存在在state中，则返回state[key]
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            //如果key值存在在props中，则返回props[key]
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

//初始化组件的slots
function initSlots(instance, children) {
    const { vnode } = instance;
    let slots = {};
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        for (let key in children) {
            let value = children[key];
            slots[key] = (props) => {
                return Array.isArray(value(props)) ? value(props) : [value(props)];
            };
        }
        instance.slots = slots;
    }
}

//创建组件实例
function createComponentInstance(vnode, parentComponent) {
    const component = {
        vnode, //组件的虚拟节点信息
        type: vnode.type, //如果是processComponent，此时的type就是component信息
        setupState: {}, //存放setup的返回值
        props: {}, //存放组件的props
        slots: {}, //存放组件的slots
        provides: parentComponent ? parentComponent.provides : {}, //存放组件的provides
        parent: parentComponent, //存放当前组件的父组件
        isMounted: false, //组件是否已经挂载
        subTree: {}, //存放组件的vnode
        emit: (key) => { }, //emit调用函数
    };
    component.emit = emit.bind(null, component);
    return component;
}
//初始化组件信息
function setupComponent(instance) {
    //初始化组件的props
    initProps(instance, instance.vnode.props);
    //初始化组件的slots
    initSlots(instance, instance.vnode.children);
    //初始化有状态的组件信息（组件的返回值，或者说是setup函数的返回值）
    setupStatefulComponent(instance);
}
//初始化有状态的组件信息(setup的返回值)
function setupStatefulComponent(instance) {
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        }); //用shallowReadonly包裹props,实现只读功能
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
//处理setup函数返回值
function handleSetupResult(instance, setupResult) {
    //setupResult的值如果是对象，那么就需要把这个值放入上下文中提供组件使用；
    //setupResult的值如果是函数，那就把这个返回的函数当成是render函数；
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
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
let currentInstance;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(value) {
    currentInstance = value;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            //第一次初始化的时候，当前的provides会等于父级的provides
            //避免多次调用的时候，重复初始化
            provides = currentInstance.provides = Object.create(parentProvides); //原型链
        }
        provides[key] = value;
    }
}
function inject(key, defaultVal) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultVal) {
            return typeof defaultVal === "function" ? defaultVal() : defaultVal;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                //此时所有的操作都是基于vnode,所有需要先转换成vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer, null);
            },
        };
    };
}
/****
 * 使用createAppAPI是基于自定义渲染的需求来处理的：通过runtime-dom中的index.ts自定义的渲染函数来完成
 */
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

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRmove, setElementText: hostSetElementText, } = options;
    //vnode:虚拟节点;container:真实挂载节点
    function render(vnode, container, parentComponent) {
        patch(null, vnode, container, parentComponent);
    }
    function patch(oldVnode, vnode, container, parentComponent) {
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
                if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(oldVnode, vnode, container, parentComponent);
                }
                else if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(oldVnode, vnode, container, parentComponent);
                }
                break;
        }
    }
    /**** =====处理vnode是component的情况 ========*/
    //处理组件信息
    function processComponent(oldVnode, vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }
    //创建组件
    function mountComponent(vnode, container, parentComponent) {
        //首先创建组件实例
        const instance = createComponentInstance(vnode, parentComponent);
        //初始化组件信息
        setupComponent(instance);
        //调用render,生成组件vnode
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                //组件初始化
                const subTree = (instance.subTree = instance.render.call(instance.proxy)); //保存组件的vnode
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                //组件更新
                const subTree = instance.render.call(instance.proxy); //保存组件的vnode
                const prevSubTree = instance.subTree; //获取组件上一次的vnode
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
                vnode.el = subTree.el;
            }
        });
    }
    /**** =====处理vnode是element的情况 ========*/
    //处理元素节点信息
    function processElement(oldVnode, vnode, container, parentComponent) {
        if (!oldVnode) {
            mountElement(vnode, container, parentComponent);
        }
        else {
            patchElement(oldVnode, vnode, container, parentComponent);
        }
    }
    //创建element
    function mountElement(vnode, container, parentComponent) {
        const { type, props, children, shapeFlag } = vnode;
        let el = (vnode.el = hostCreateElement(type));
        for (const key in props) {
            hostPatchProp(el, key, null, props[key]);
        }
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            //如果children是数组
            mountChildren(vnode.children, el, parentComponent);
        }
        // container.append(el);
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((child) => {
            patch(null, child, container, parentComponent);
        });
    }
    //更新element
    function patchElement(oldVnode, vnode, container, parentComponent) {
        const el = (vnode.el = oldVnode.el);
        const oldProps = oldVnode.props || {};
        const newProps = vnode.props || {};
        //更新children
        patchChildren(el, oldVnode, vnode, parentComponent);
        //更新props
        patchProps(el, oldProps, newProps);
    }
    function unmountedChildren(children) {
        for (let index = 0; index < children.length; index++) {
            let el = children[index].el;
            hostRmove(el);
        }
    }
    //更新children，对比新旧节点
    function patchChildren(container, oldVnode, vnode, parentComponent) {
        const oldShapFlag = oldVnode.shapeFlag;
        const newShapFlag = vnode.shapeFlag;
        if (newShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            //如果新节点是文本:老节点是文本或者数组
            if (oldShapFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                //如果老节点是数组：直接删除老节点，设置文本
                unmountedChildren(oldVnode.children);
            }
            if (oldVnode.children !== vnode.children) {
                hostSetElementText(container, vnode.children);
            }
        }
        else if (newShapFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            //如果新节点是数组：
            if (oldShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                //如果老节点是文本：删除文本，把数组mount到节点上
                hostSetElementText(container, "");
                mountChildren(vnode.children, container, parentComponent);
            }
        }
    }
    //更新element props
    function patchProps(el, oldProps, newProps) {
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
    function processFragment(oldVnode, vnode, container, parentComponent) {
        mountChildren(vnode.children, container, parentComponent);
    }
    // ==== 处理type为Text的时候（children数组中有文本节点）===
    function processText(oldVnode, vnode, container) {
        const { children } = vnode;
        const textNode = (vnode.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevProp, nextProp) {
    const isOn = (key) => /^on[A-Z]/.test(key); //判断是否以on开头并且第三个字母是大写的
    if (isOn(key)) {
        //绑定事件
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextProp);
    }
    else {
        if (nextProp === undefined || nextProp === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextProp);
        }
    }
}
function insert(el, container) {
    container.append(el);
}
function remove(child) {
    let parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    //设置文本子节点
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
