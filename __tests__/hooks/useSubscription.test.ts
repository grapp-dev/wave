import * as React from 'react';

import { act, renderHook } from '@testing-library/react-hooks';

import { describe, expect, it, jest } from 'bun:test';

import { fromArray, fromValue, makeBehaviorSubject, makeSubject, useSubscription } from '../../src';

describe('useSubscription', () => {
  it('should always return the same Subscription after first rendering', () => {
    const source = fromArray([1, 2, 3]);
    const { result, rerender } = renderHook(() => {
      const subscriptionRef = useSubscription(source, () => {
        //
      });
      return subscriptionRef.current;
    });
    expect(result.current).toBeUndefined();
    rerender();
    const subscription = result.current;
    rerender();
    expect(subscription).toBe(result.current);
  });

  it('should be able to access closure', () => {
    const subject = makeSubject<number>();
    const spy = jest.fn();
    const { rerender, result } = renderHook(
      props => {
        const [value, setState] = React.useState('s1');
        useSubscription(subject.source, num => {
          spy(num, value, props.prop);
        });
        return { setState };
      },
      {
        initialProps: {
          prop: 'p1',
        },
      },
    );

    expect(spy).toBeCalledTimes(0);
    subject.next(1);
    expect(spy).lastCalledWith(1, 's1', 'p1');

    spy.mockClear();

    act(() => {
      result.current.setState('s2');
    });

    expect(spy).toBeCalledTimes(0);
    subject.next(2);
    expect(spy).lastCalledWith(2, 's2', 'p1');

    spy.mockClear();

    rerender({ prop: 'p2' });
    expect(spy).toBeCalledTimes(0);

    subject.next(2);

    expect(spy).lastCalledWith(2, 's2', 'p2');
  });

  it('should invoke the latest callback', () => {
    const subject = makeSubject<number>();
    const spy1 = jest.fn();
    const spy2 = jest.fn();
    const { rerender } = renderHook(
      props => {
        useSubscription(subject.source, props.callbackFn);
      },
      {
        initialProps: {
          callbackFn: spy1,
        },
      },
    );

    expect(spy1).toBeCalledTimes(0);
    expect(spy2).toBeCalledTimes(0);

    subject.next(1);

    expect(spy1).toBeCalledTimes(1);
    expect(spy1).lastCalledWith(1);
    expect(spy2).toBeCalledTimes(0);

    spy1.mockClear();
    spy2.mockClear();

    rerender({ callbackFn: spy2 });
    subject.next(2);

    expect(spy1).toBeCalledTimes(0);
    expect(spy2).toBeCalledTimes(1);
    expect(spy2).lastCalledWith(2);
  });

  it('should be able to access closure', () => {
    const subject = makeSubject<number>();
    const spy = jest.fn();
    const { rerender, result } = renderHook(
      props => {
        const [stateVal, setState] = React.useState('s1');

        useSubscription(subject.source, num => {
          spy(num, stateVal, props.value);
        });

        return { setState };
      },
      {
        initialProps: {
          value: 'p1',
        },
      },
    );
    expect(spy).toBeCalledTimes(0);
    subject.next(1);
    expect(spy).lastCalledWith(1, 's1', 'p1');

    spy.mockClear();
    act(() => {
      result.current.setState('s2');
    });
    expect(spy).toBeCalledTimes(0);
    subject.next(2);
    expect(spy).lastCalledWith(2, 's2', 'p1');

    spy.mockClear();
    rerender({ value: 'p2' });
    expect(spy).toBeCalledTimes(0);
    subject.next(2);
    expect(spy).lastCalledWith(2, 's2', 'p2');
  });

  it('should not emit value for callback changing', () => {
    const subject = makeSubject();
    const spy1 = jest.fn();
    const spy2 = jest.fn();

    const { rerender } = renderHook(
      props => {
        useSubscription(subject.source, props.callbackFn);
      },
      {
        initialProps: {
          callbackFn: spy1,
        },
      },
    );
    expect(spy1).toBeCalledTimes(0);
    expect(spy2).toBeCalledTimes(0);
    subject.next(1);

    expect(spy1).toBeCalledTimes(1);
    expect(spy1).lastCalledWith(1);
    expect(spy2).toBeCalledTimes(0);

    spy1.mockClear();
    spy2.mockClear();

    rerender({ callbackFn: spy2 });

    expect(spy1).toBeCalledTimes(0);
    expect(spy2).toBeCalledTimes(0);
  });

  it('should unsubscribe when unmount', () => {
    const subject = makeBehaviorSubject(1);
    const spy = jest.fn();

    const { unmount } = renderHook(() => {
      useSubscription(subject.source, spy);
    });

    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith(1);

    subject.next(2);

    expect(spy).toBeCalledTimes(2);
    expect(spy).lastCalledWith(2);

    spy.mockClear();
    unmount();

    subject.next(3);
    expect(spy).toBeCalledTimes(0);
  });

  it('should unsubscribe old source and subscribe to new one when it changes', () => {
    const source1 = fromValue(1);
    const source2 = fromValue(2);
    const spy = jest.fn();

    const { rerender } = renderHook(
      props => {
        useSubscription(props.input, spy);
      },
      {
        initialProps: {
          input: source1,
        },
      },
    );

    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith(1);

    rerender({ input: source2 });

    expect(spy).toBeCalledTimes(2);
    expect(spy).lastCalledWith(2);
  });
});
