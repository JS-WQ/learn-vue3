const publicPropertiesMap = {
  $el: (instance: any) => instance.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }: any, key: string) {
    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }
    const publicGetter = (publicPropertiesMap as any)[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
