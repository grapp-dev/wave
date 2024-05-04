import { describe, expect, it, jest } from 'bun:test';
import { forEach, fromArray, fromPromise, map, merge, pipe } from 'wonka';

import { endWith } from '../../src';
import { delay, flushPromises, makePromise } from '../utils';

describe('endWith', () => {
  it('', () => {
    const spy = jest.fn();

    pipe(fromArray([1, 2, 3]), endWith(0), forEach(spy));

    expect(spy.mock.calls).toEqual([[1], [2], [3], [0]]);
  });

  it('', async () => {
    const spy = jest.fn();
    const promise100 = makePromise(100);
    const promise200 = makePromise(200);

    pipe(
      merge([fromPromise(promise200('healthy')), fromPromise(promise100('safe'))]),
      map(value => `stay ${value}`),
      endWith('stay calm'),
      forEach(spy),
    );

    await delay(200);

    await flushPromises(() => {
      expect(spy.mock.calls).toEqual([['stay safe'], ['stay healthy'], ['stay calm']]);
    });
  });
});
