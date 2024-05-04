import * as React from 'react';

import { act, renderHook } from '@testing-library/react-hooks';

import { describe, expect, it, jest } from 'bun:test';

import { fromValue, map, pipe, Source, subscribe, useSource } from '../../src';

describe('useSource', () => {
  it('should call the init function once', () => {
    const spy = jest.fn(() => {
      return fromValue(Date.now());
    });
    const { rerender } = renderHook(() => {
      return useSource(spy);
    });
    expect(spy).toBeCalledTimes(1);
    rerender();
    expect(spy).toBeCalledTimes(1);
    rerender();
    expect(spy).toBeCalledTimes(1);
  });

  it('should call the init function once with inputs', () => {
    const spy = jest.fn((source: Source<[number]>) => {
      return pipe(
        source,
        map(([value]) => {
          return value;
        }),
      );
    });
    const { rerender } = renderHook(
      props => {
        return useSource(spy, [props.value]);
      },
      {
        initialProps: {
          value: 1,
        },
      },
    );
    expect(spy).toBeCalledTimes(1);
    rerender({ value: 2 });
    expect(spy).toBeCalledTimes(1);
    rerender({ value: 3 });
    expect(spy).toBeCalledTimes(1);
  });

  it('should always return the same source with inputs', () => {
    const { result, rerender } = renderHook(
      props => {
        return useSource(
          source => {
            return pipe(
              source,
              map(([value]) => {
                return value;
              }),
            );
          },
          [props.value],
        );
      },
      {
        initialProps: {
          value: 1,
        },
      },
    );
    const source = result.current;
    const spy = jest.fn();
    subscribe(spy)(source);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(1);
    spy.mockClear();
    rerender({ value: 2 });
    expect(result.current).toBe(source);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(2);
  });

  it('should be able to be shared with multiple observers', () => {
    const { result } = renderHook(() => {
      const [state, setState] = React.useState(1);
      const source = useSource(
        source => {
          return pipe(
            source,
            map(([value]) => {
              return value;
            }),
          );
        },
        [state],
      );
      return { setState, source };
    });

    const { setState, source } = result.current;

    const spies = Array.from(Array(10)).map(() => {
      return jest.fn();
    });

    spies.forEach(spy => {
      subscribe(spy)(source);
    });

    spies.forEach(spy => {
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(1);
    });

    act(() => {
      setState(2);
    });

    spies.forEach(spy => {
      expect(spy).toBeCalledTimes(2);
      expect(spy).toBeCalledWith(2);
    });

    act(() => {
      setState(3);
    });

    spies.forEach(spy => {
      expect(spy).toBeCalledTimes(3);
      expect(spy).toBeCalledWith(3);
    });

    act(() => {
      setState(4);
    });

    spies.forEach(spy => {
      expect(spy).toBeCalledTimes(4);
      expect(spy).toBeCalledWith(4);
    });
  });

  it('should emit value when one of the deps changes', () => {
    const { result, rerender } = renderHook(
      props => {
        return useSource(
          source => {
            return pipe(
              source,
              map(([value]) => {
                return value;
              }),
            );
          },
          [props.text],
        );
      },
      {
        initialProps: {
          text: 'hello',
        },
      },
    );

    const { current: source } = result;
    const spy = jest.fn();
    subscribe(spy)(source);
    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith('hello');
    rerender({ text: 'world' });
    expect(spy).toBeCalledTimes(2);
    expect(spy).lastCalledWith('world');
  });
});
