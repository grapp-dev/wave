import { renderHook } from '@testing-library/react-hooks';

import { describe, expect, it, jest } from 'bun:test';

import { Source, subscribe, useSourceCallback } from '../../src';

const identity = <T>(source: Source<T>) => {
  return source;
};

describe('useSourceCallback', () => {
  it('should call the init function once', () => {
    const spy = jest.fn(identity);
    const { rerender } = renderHook(() => {
      return useSourceCallback(spy);
    });
    expect(spy).toBeCalledTimes(1);
    rerender();
    expect(spy).toBeCalledTimes(1);
    rerender();
    expect(spy).toBeCalledTimes(1);
  });

  it('should always return the same callback and source', () => {
    const { result, rerender } = renderHook(() => {
      return useSourceCallback<string>(identity);
    });
    const firstResult = result.current;
    rerender();
    expect(firstResult).not.toBe(result.current);
    expect(result.current).toStrictEqual(firstResult);
  });

  it('should emit value when the callback is called', () => {
    const { result } = renderHook(() => {
      return useSourceCallback<string>(identity);
    });
    const [source, onChange] = result.current;
    const spy = jest.fn();
    subscribe(spy)(source);
    expect(spy).toBeCalledTimes(0);
    onChange('hello');
    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith('hello');
    onChange('world');
    expect(spy).toBeCalledTimes(2);
    expect(spy).lastCalledWith('world');
  });

  it('should get the selected argument from selector', () => {
    const { result } = renderHook(() => {
      return useSourceCallback<string, string, [boolean, string]>(identity, (_, str) => str);
    });
    const [source, onChange] = result.current;
    const spy = jest.fn();
    subscribe(spy)(source);
    expect(spy).toBeCalledTimes(0);
    onChange(true, 'hello');
    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith('hello');
    onChange(false, 'world');
    expect(spy).toBeCalledTimes(2);
    expect(spy).lastCalledWith('world');
  });

  it('should get a observable of events if no argument', () => {
    const { result } = renderHook(() => {
      return useSourceCallback<string>();
    });
    const [source, onChange] = result.current;
    const spy = jest.fn();
    subscribe(spy)(source);
    expect(spy).toBeCalledTimes(0);
    onChange('hello');
    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith('hello');
    onChange('world');
    expect(spy).toBeCalledTimes(2);
    expect(spy).lastCalledWith('world');
  });
});
