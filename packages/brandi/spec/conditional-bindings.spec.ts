import { Container, injected, tag, tagged, token } from '../src';

import { setEnv } from './utils';

describe('conditional bindings', () => {
  describe('toInstance', () => {
    it('creates an instance with an injection that depends on the target', () => {
      const someValue = 1;
      const anotherValue = 2;

      class SomeClass {
        constructor(public value: number) {}
      }

      class AnotherClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
        someClass: token<SomeClass>('someClass'),
        anotherClass: token<AnotherClass>('anotherClass'),
      };

      injected(SomeClass, tokens.someValue);
      injected(AnotherClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(someValue);
      container
        .when(AnotherClass)
        .bind(tokens.someValue)
        .toConstant(anotherValue);

      container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();
      container
        .bind(tokens.anotherClass)
        .toInstance(AnotherClass)
        .inTransientScope();

      const someClassInstance = container.get(tokens.someClass);
      const anotherClassInstance = container.get(tokens.anotherClass);

      expect(someClassInstance.value).toBe(someValue);
      expect(anotherClassInstance.value).toBe(anotherValue);
    });

    it('creates an instance with an injection that depends on the tag', () => {
      const someValue = 1;
      const anotherValue = 2;

      class SomeClass {
        constructor(public value: number) {}
      }

      class AnotherClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
        someClass: token<SomeClass>('someClass'),
        anotherClass: token<AnotherClass>('anotherClass'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      injected(AnotherClass, tokens.someValue);
      tagged(AnotherClass, tags.some);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(someValue);
      container.when(tags.some).bind(tokens.someValue).toConstant(anotherValue);

      container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();
      container
        .bind(tokens.anotherClass)
        .toInstance(AnotherClass)
        .inTransientScope();

      const someClassInstance = container.get(tokens.someClass);
      const anotherClassInstance = container.get(tokens.anotherClass);

      expect(someClassInstance.value).toBe(someValue);
      expect(anotherClassInstance.value).toBe(anotherValue);
    });
  });

  describe('toCall', () => {
    it('creates a call result with an injection that depends on the target', () => {
      const someValue = 1;
      const anotherValue = 2;

      interface SomeResult {
        some: number;
      }

      interface AnotherResult {
        another: number;
      }

      const createSome = (value: number): SomeResult => ({ some: value });
      const createAnother = (value: number): AnotherResult => ({
        another: value,
      });

      const tokens = {
        someValue: token<number>('someValue'),
        someResult: token<SomeResult>('someResult'),
        anotherResult: token<AnotherResult>('anotherResult'),
      };

      injected(createSome, tokens.someValue);
      injected(createAnother, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(someValue);
      container
        .when(createAnother)
        .bind(tokens.someValue)
        .toConstant(anotherValue);

      container.bind(tokens.someResult).toCall(createSome).inTransientScope();
      container
        .bind(tokens.anotherResult)
        .toCall(createAnother)
        .inTransientScope();

      const someResult = container.get(tokens.someResult);
      const anotherResult = container.get(tokens.anotherResult);

      expect(someResult.some).toBe(someValue);
      expect(anotherResult.another).toBe(anotherValue);
    });

    it('creates a call result with an injection that depends on the tag', () => {
      const someValue = 1;
      const anotherValue = 2;

      interface SomeResult {
        some: number;
      }

      interface AnotherResult {
        another: number;
      }

      const createSome = (value: number): SomeResult => ({ some: value });
      const createAnother = (value: number): AnotherResult => ({
        another: value,
      });

      const tokens = {
        someValue: token<number>('someValue'),
        someResult: token<SomeResult>('someResult'),
        anotherResult: token<AnotherResult>('anotherResult'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(createSome, tokens.someValue);

      injected(createAnother, tokens.someValue);
      tagged(createAnother, tags.some);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(someValue);
      container.when(tags.some).bind(tokens.someValue).toConstant(anotherValue);

      container.bind(tokens.someResult).toCall(createSome).inTransientScope();
      container
        .bind(tokens.anotherResult)
        .toCall(createAnother)
        .inTransientScope();

      const someResult = container.get(tokens.someResult);
      const anotherResult = container.get(tokens.anotherResult);

      expect(someResult.some).toBe(someValue);
      expect(anotherResult.another).toBe(anotherValue);
    });
  });

  describe('Container.get', () => {
    it('returns a dependency with a condition', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      const someValue = 1;
      const anotherValue = 2;
      const otherValue = 3;

      class SomeClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(someValue);
      container.when(tags.some).bind(tokens.someValue).toConstant(anotherValue);
      container.when(SomeClass).bind(tokens.someValue).toConstant(otherValue);

      expect(container.get(tokens.someValue)).toBe(someValue);
      expect(container.get(tokens.someValue, [])).toBe(someValue);
      expect(container.get(tokens.someValue, [tags.some])).toBe(anotherValue);
      expect(container.get(tokens.someValue, [SomeClass])).toBe(otherValue);
      expect(container.get(tokens.someValue, [tags.some, SomeClass])).toBe(
        anotherValue,
      );
      expect(container.get(tokens.someValue, [SomeClass, tags.some])).toBe(
        otherValue,
      );

      spy.mockRestore();
    });

    it('logs a warning when multiple related conditions were passed', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class SomeClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(0);
      container.when(tags.some).bind(tokens.someValue).toConstant(0);
      container.when(SomeClass).bind(tokens.someValue).toConstant(0);

      container.get(tokens.someValue, [SomeClass, tags.some]);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

      spy.mockRestore();
    });

    it('does not log a warning when a single related condition were passed', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class SomeClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(0);
      container.when(tags.some).bind(tokens.someValue).toConstant(0);
      container.when(SomeClass).bind(tokens.someValue).toConstant(0);

      container.get(tokens.someValue, [SomeClass]);
      container.get(tokens.someValue, [tags.some]);

      expect(spy).toHaveBeenCalledTimes(0);

      spy.mockRestore();
    });

    it("skips the logging in 'production' env", () => {
      const restoreEnv = setEnv('production');
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

      class SomeClass {
        constructor(public value: number) {}
      }

      const tokens = {
        someValue: token<number>('someValue'),
      };

      const tags = {
        some: tag('some'),
      };

      injected(SomeClass, tokens.someValue);

      const container = new Container();

      container.bind(tokens.someValue).toConstant(0);
      container.when(tags.some).bind(tokens.someValue).toConstant(0);
      container.when(SomeClass).bind(tokens.someValue).toConstant(0);

      container.get(tokens.someValue, [SomeClass, tags.some]);

      expect(spy).toHaveBeenCalledTimes(0);

      restoreEnv();
      spy.mockRestore();
    });
  });

  it('injects a dependency by the target condition when there are conditions for both the target and the tag', () => {
    const someValue = 1;
    const anotherValue = 2;

    class SomeClass {
      constructor(public value: number) {}
    }

    class AnotherClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
      anotherClass: token<AnotherClass>('anotherClass'),
    };

    const tags = {
      some: tag('some'),
    };

    injected(SomeClass, tokens.someValue);
    tagged(SomeClass, tags.some);

    injected(AnotherClass, tokens.someValue);
    tagged(AnotherClass, tags.some);

    const container = new Container();

    container.when(tags.some).bind(tokens.someValue).toConstant(someValue);
    container
      .when(AnotherClass)
      .bind(tokens.someValue)
      .toConstant(anotherValue);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();
    container
      .bind(tokens.anotherClass)
      .toInstance(AnotherClass)
      .inTransientScope();

    const someClassInstance = container.get(tokens.someClass);
    const anotherClassInstance = container.get(tokens.anotherClass);

    expect(someClassInstance.value).toBe(someValue);
    expect(anotherClassInstance.value).toBe(anotherValue);
  });

  it('ignores an unused tag on the target', () => {
    const someValue = 1;

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    const tags = {
      unused: tag('unused'),
    };

    injected(SomeClass, tokens.someValue);

    tagged(SomeClass, tags.unused);

    const container = new Container();
    container.bind(tokens.someValue).toConstant(someValue);
    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const instance = container.get(tokens.someClass);

    expect(instance.value).toBe(someValue);
  });

  it('takes a binding by the tag assigned first with multiple related tags on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    const someValue = 1;
    const anotherValue = 2;
    const otherValue = 3;

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    const tags = {
      some: tag('some'),
      another: tag('another'),
      other: tag('other'),
    };

    injected(SomeClass, tokens.someValue);
    tagged(SomeClass, tags.some, tags.another, tags.other);

    const container = new Container();

    container.when(tags.other).bind(tokens.someValue).toConstant(otherValue);
    container.when(tags.some).bind(tokens.someValue).toConstant(someValue);
    container
      .when(tags.another)
      .bind(tokens.someValue)
      .toConstant(anotherValue);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    const instance = container.get(tokens.someClass);

    expect(instance.value).toBe(someValue);

    spy.mockRestore();
  });

  it('logs a warning when multiple related tags are on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    const tags = {
      some: tag('some'),
      another: tag('another'),
    };

    injected(SomeClass, tokens.someValue);
    tagged(SomeClass, tags.some, tags.another);

    const container = new Container();

    container.when(tags.another).bind(tokens.someValue).toConstant(0);
    container.when(tags.some).bind(tokens.someValue).toConstant(0);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    container.get(tokens.someClass);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchSnapshot();

    spy.mockRestore();
  });

  it('does not log a warning when a single related tag are on the target', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    class SomeClass {
      constructor(public value: number) {}
    }

    class AnotherClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
      anotherClass: token<AnotherClass>('anotherClass'),
    };

    const tags = {
      some: tag('some'),
    };

    injected(SomeClass, tokens.someValue);
    injected(AnotherClass, tokens.someValue);

    tagged(AnotherClass, tags.some);

    const container = new Container();

    container.bind(tokens.someValue).toConstant(0);
    container.when(tags.some).bind(tokens.someValue).toConstant(0);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();
    container
      .bind(tokens.anotherClass)
      .toInstance(AnotherClass)
      .inTransientScope();

    container.get(tokens.someClass);
    container.get(tokens.anotherClass);

    expect(spy).toHaveBeenCalledTimes(0);

    spy.mockRestore();
  });

  it("skips the logging in 'production' env", () => {
    const restoreEnv = setEnv('production');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => null);

    class SomeClass {
      constructor(public value: number) {}
    }

    const tokens = {
      someValue: token<number>('someValue'),
      someClass: token<SomeClass>('someClass'),
    };

    const tags = {
      some: tag('some'),
      another: tag('another'),
    };

    injected(SomeClass, tokens.someValue);
    tagged(SomeClass, tags.some, tags.another);

    const container = new Container();

    container.when(tags.another).bind(tokens.someValue).toConstant(0);
    container.when(tags.some).bind(tokens.someValue).toConstant(0);

    container.bind(tokens.someClass).toInstance(SomeClass).inTransientScope();

    container.get(tokens.someClass);

    expect(spy).toHaveBeenCalledTimes(0);

    restoreEnv();
    spy.mockRestore();
  });
});