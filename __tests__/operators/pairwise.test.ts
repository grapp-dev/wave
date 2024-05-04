import { describe, expect, it, jest } from 'bun:test';
import { forEach, fromArray, pipe } from 'wonka';

import { makeBehaviorSubject, pairwise } from '../../src';

describe('pairwise', () => {
  it('', () => {
    const spy = jest.fn();

    pipe(fromArray([1, 2, 3, 4, 5]), pairwise, forEach(spy));

    expect(spy.mock.calls).toEqual([[[1, 2]], [[2, 3]], [[3, 4]], [[4, 5]]]);
  });

  it('', () => {
    const spy = jest.fn();
    const subject = makeBehaviorSubject(1);

    pipe(subject.source, pairwise, forEach(spy));

    subject.next(2);
    subject.next(3);

    expect(spy.mock.calls).toEqual([[[1, 2]], [[2, 3]]]);
  });
});
