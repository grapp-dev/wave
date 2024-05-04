import { describe, expect, it, jest } from 'bun:test';
import { forEach, fromArray, fromPromise, map, merge, pipe } from 'wonka';

import { startWith } from '../../src';
import { delay, flushPromises, makePromise } from '../utils';

describe('startWith', () => {
  it('', () => {
    const spy = jest.fn();

    pipe(fromArray([1, 2, 3]), startWith(0), forEach(spy));

    expect(spy).toBeCalledTimes(4);
    expect(spy.mock.calls).toEqual([[0], [1], [2], [3]]);
  });

  it('', async () => {
    const spy = jest.fn();
    const promise100 = makePromise(100);
    const promise200 = makePromise(200);

    pipe(
      merge([fromPromise(promise100('healthy')), fromPromise(promise200('safe'))]),
      map(value => `stay ${value}`),
      startWith('stay calm'),
      forEach(spy),
    );

    await delay(200);

    await flushPromises(() => {
      expect(spy.mock.calls).toEqual([['stay calm'], ['stay healthy'], ['stay safe']]);
    });
  });
});
