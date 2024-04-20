import { effect } from "../effect";
import {
  isProxy,
  isReactive,
  isReadonly,
  reactive,
  readonly,
  shallowReadonly,
} from "../reactive";
import { isRef, ref, unRef } from "../ref";
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
  });
  it("readonly", () => {
    const original = { foo: 1 };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });
  it("readonly warn", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });
    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
  });
  it("isReactive", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });
  it("isReadonly", () => {
    const original = { foo: 1 };
    const observed = readonly(original);
    const observed2 = reactive(original);
    expect(isReadonly(observed)).toBe(true);
    expect(isReadonly(observed2)).toBe(false);
    expect(isReadonly(original)).toBe(false);
  });
  it("nested reactive", () => {
    const original = {
      nested: { foo: 1 },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
  it("nested readonly", () => {
    const original = {
      nested: { foo: 1 },
      array: [{ bar: 2 }],
    };
    const observed = readonly(original);
    expect(isReadonly(observed.nested)).toBe(true);
    expect(isReadonly(observed.array)).toBe(true);
    expect(isReadonly(observed.array[0])).toBe(true);
  });
  it("shallowReadonly", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });
  it("isProxy", () => {
    const original = {
      nested: { foo: 1 },
      array: [{ bar: 2 }],
    };
    const p1 = readonly(original);
    const p2 = reactive(original);
    expect(isProxy(p1)).toBe(true);
    expect(isProxy(p2)).toBe(true);
  });
  it("ref", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });

    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });
  it("nested ref", () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });
    it("isRef", () => {
      const a = ref(1);
      const user = reactive({ age: 1 });
      expect(isRef(a)).toBe(true);
      expect(isRef(1)).toBe(false);
      expect(isRef(user)).toBe(false);
    });
    it("unRef", () => {
      const a = ref(1);
      expect(unRef(a)).toBe(1);
      expect(unRef(1)).toBe(1);
    });
});
