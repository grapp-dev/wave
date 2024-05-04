import { describe, expect, it, jest } from 'bun:test';
import { forEach, fromArray, pipe } from 'wonka';

import { distinctUntilChanged, makeBehaviorSubject } from '../../src';

describe('distinctUntilChanged', () => {
  it('', () => {
    const spy = jest.fn();

    pipe(
      fromArray([1, 1, 2, 2, 2, 3, 3, 3, 4, 5, 5, 1]),
      distinctUntilChanged((x, y) => x === y),
      forEach(spy),
    );

    expect(spy.mock.calls).toEqual([[1], [2], [3], [4], [5], [1]]);
  });

  it('', () => {
    const spy = jest.fn();
    const subject = makeBehaviorSubject(1);

    pipe(
      subject.source,
      distinctUntilChanged((x, y) => x === y),
      forEach(spy),
    );

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(3);
    subject.next(4);
    subject.next(4);
    subject.next(5);
    subject.next(1);

    expect(spy.mock.calls).toEqual([[1], [2], [3], [4], [5], [1]]);
  });
});
