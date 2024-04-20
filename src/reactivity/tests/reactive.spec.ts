import { isReactive, isReadonly, reactive, readonly } from "../reactive";
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
});
