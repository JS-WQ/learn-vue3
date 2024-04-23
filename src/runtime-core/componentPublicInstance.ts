import { hasOwn } from "../shared";

const publicPropertiesMap = {
  $el: (instance: any) => instance.vnode.el,
  $slots: (instance: any) => instance.slots,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }: any, key: string) {
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      //如果key值存在在state中，则返回state[key]
      return setupState[key];
    } else if (hasOwn(props, key)) {
      //如果key值存在在props中，则返回props[key]
      return props[key];
    }

    const publicGetter = (publicPropertiesMap as any)[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
