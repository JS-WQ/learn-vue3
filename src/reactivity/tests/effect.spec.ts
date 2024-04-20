import { reactive } from "../reactive";
import { effect, stop } from "../effect";

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
  it("scheduler", () => {
    //1.当effect第一次执行的时候，会顺利的执行fn
    //2.当响应式对象set（update）的时候，不会再执行fn,而是执行 scheduler
    //3.当执行runner的时候，fn才会再次被执行
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });
  it("stop", () => {
    let dummy;
    const obj = reactive({ foo: 1, age: 18 });
    const runner = effect(() => {
      dummy = obj.foo;
    });
    
    obj.foo = 2;
    expect(dummy).toBe(2);
    stop(runner);
    obj.foo++;
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
  });
  it("onStop", () => {
    const obj = reactive({ foo: 1 });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { onStop }
    );
    stop(runner);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
