import { describe, expect, it, jest } from 'bun:test';
import { forEach, fromArray, fromPromise, map, mergeAll, pipe } from 'wonka';

import { timeoutWith } from '../../src';
import { delay, flushPromises, makePromise } from '../utils';

describe('timeoutWith', () => {
  it('', async () => {
    const spy = jest.fn();
    const promise200 = makePromise(200);

    pipe(fromPromise(promise200('hello')), timeoutWith('timeout', 300), forEach(spy));

    await delay(200);

    await flushPromises(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('hello');
    });
  });

  it('', async () => {
    const spy = jest.fn();
    const promise200 = makePromise(200);

    pipe(fromPromise(promise200('hello')), timeoutWith('timeout', 100), forEach(spy));

    await delay(200);

    await flushPromises(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('timeout');
    });
  });

  it('', () => {
    const spy = jest.fn();

    pipe(fromArray([1, 2, 3]), timeoutWith(0, 0), forEach(spy));

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toEqual([[1], [2], [3]]);
  });

  it('', async () => {
    const spy = jest.fn();
    const promise200 = makePromise(200);
    const promise500 = makePromise(500);

    pipe(
      fromArray([fromPromise(promise200('hello')), fromPromise(promise500('world'))]),
      map(source => {
        return pipe(source, timeoutWith('timeout', 300));
      }),
      mergeAll,
      forEach(spy),
    );

    await delay(200);

    await flushPromises(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('hello');
    });

    await delay(200);

    await flushPromises(() => {
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.mock.calls).toEqual([['hello'], ['timeout']]);
    });
  });
});
