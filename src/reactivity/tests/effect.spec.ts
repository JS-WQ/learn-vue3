import { reactive } from "../reactive";
import { effect } from "../effect";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
    user.age++;
    expect(nextAge).toBe(12);
  });
  it("runner path", () => {
    //effect执行完后会把fn返回出去，赋值给runner,执行runner就是再次执行fn,同时执行fn也会将值返回出去
    let foo = 10;
    let runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    let r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("foo");
  });
});
