import { describe, expect, it, jest } from 'bun:test';
import { forEach, pipe } from 'wonka';

import { timer } from '../../src';
import { delay } from '../utils';

describe('timer', () => {
  it('', async () => {
    const spy = jest.fn();

    pipe(timer(100), forEach(spy));

    await delay(200);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(0);
  });
});
