import { describe, expect, it, jest } from 'bun:test';
import { forEach, fromArray, pipe } from 'wonka';

import { reduce } from '../../src';

describe('reduce', () => {
  it('', () => {
    const spy = jest.fn();

    pipe(
      fromArray([1, 2, 3, 4, 5]),
      reduce((acc, value) => {
        return acc.concat([value * 10]);
      }, [] as number[]),
      forEach(spy),
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith([10, 20, 30, 40, 50]);
  });
});
