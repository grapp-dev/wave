import { describe, expect, it, jest } from 'bun:test';
import { forEach, fromArray, fromPromise, fromValue, mergeMap, pipe } from 'wonka';

import { forkJoin, makeBehaviorSubject } from '../../src';
import { delay, flushPromises, makePromise } from '../utils';

describe('forkJoin', () => {
  it('', async () => {
    const spy = jest.fn();
    const promise200 = makePromise(200);
    const promise500 = makePromise(500);

    pipe(
      forkJoin(
        fromPromise(promise200('hello')),
        fromArray(['x', 'y', 'z']),
        fromPromise(promise500(100)),
        fromValue(200),
      ),
      forEach(spy),
    );

    await delay(500);

    await flushPromises(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(['hello', 'x', 100, 200]);
    });
  });

  it('', async () => {
    const spy = jest.fn();
    const promise200 = makePromise(200);
    const promise300 = makePromise(300);
    const subject = makeBehaviorSubject(3);

    pipe(
      subject.source,
      mergeMap(value => {
        return forkJoin(fromPromise(promise300(1)), fromPromise(promise200(2)), fromValue(value));
      }),
      forEach(spy),
    );

    subject.next(4);
    subject.next(5);

    await delay(500);

    await flushPromises(() => {
      expect(spy.mock.calls).toEqual([[[1, 2, 3]], [[1, 2, 4]], [[1, 2, 5]]]);
    });
  });
});
