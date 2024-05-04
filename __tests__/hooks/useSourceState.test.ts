import { act, renderHook } from '@testing-library/react-hooks';

import { describe, expect, it, jest } from 'bun:test';

import { fromArray, makeSubject, useSourceState } from '../../src';

describe('useSourceState', () => {
  it('should start receiving values after first rendering', () => {
    const spy = jest.fn();
    const source = fromArray([1, 2, 3]);
    const { result } = renderHook(() => {
      const state = useSourceState(source);
      spy(state);
      return state;
    });
    expect(result.current).toBe(3);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, 3);
    expect(spy).toHaveBeenNthCalledWith(2, 3);
  });

  it('should update value when the source emits value', () => {
    const subject = makeSubject<number>();
    const { result } = renderHook(() => {
      return useSourceState(subject.source);
    });
    expect(result.current).toBeUndefined();
    act(() => {
      subject.next(1);
    });
    expect(result.current).toBe(1);
    act(() => {
      subject.next(2);
    });
    expect(result.current).toBe(2);
  });

  it('should get the init state if given', () => {
    const subject = makeSubject<number>();
    const { result } = renderHook(() => {
      return useSourceState(subject.source, 1);
    });
    expect(result.current).toBe(1);
  });

  it('should ignore the given init state when source also emits sync values', () => {
    const source = fromArray([1, 2]);
    const { result } = renderHook(() => {
      return useSourceState(source, 3);
    });
    expect(result.current).toBe(2);
  });
});
