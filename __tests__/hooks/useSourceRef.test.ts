import { renderHook } from '@testing-library/react-hooks';

import { describe, expect, it, jest } from 'bun:test';

import { subscribe, useSourceRef } from '../../src';

describe('useSourceRef', () => {
  it('should emit undefined value on subscribe', () => {
    const spy = jest.fn();
    const { result } = renderHook(() => {
      const sourceRef = useSourceRef();
      spy();
      return sourceRef;
    });
    const [source, ref] = result.current;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ref.current).toBeUndefined();

    const value = jest.fn();
    subscribe(value)(source);
    expect(value).toHaveBeenCalledTimes(1);
    expect(value).lastCalledWith(undefined);
  });

  it('should emit initial value on subscribe', () => {
    const spy = jest.fn();
    const { result } = renderHook(() => {
      const sourceRef = useSourceRef('initial');
      spy();
      return sourceRef;
    });
    const [source, ref] = result.current;

    expect(spy).toHaveBeenCalledTimes(1);
    expect(ref.current).toBe('initial');

    const value = jest.fn();
    subscribe(value)(source);
    expect(value).toHaveBeenCalledTimes(1);
    expect(value).lastCalledWith('initial');
  });

  it('should emit new value when ref.current is updated', () => {
    const { result } = renderHook(() => {
      return useSourceRef(1);
    });
    const [source, ref] = result.current;

    const spy = jest.fn();

    subscribe(spy)(source);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).lastCalledWith(1);
    expect(ref.current).toBe(1);

    ref.current = 2;

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).lastCalledWith(2);
    expect(ref.current).toBe(2);
  });
});
