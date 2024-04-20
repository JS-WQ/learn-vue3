import { isReactive, isReadonly, reactive, readonly, shallowReadonly } from "../reactive";
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
});
