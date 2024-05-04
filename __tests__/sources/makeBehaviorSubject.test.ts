import { describe, expect, it, jest } from 'bun:test';
import { forEach } from 'wonka';

import { makeBehaviorSubject } from '../../src';

describe('makeBehaviorSubject', () => {
  it('', () => {
    const spy = jest.fn();
    const subject = makeBehaviorSubject('hello');

    forEach(spy)(subject.source);

    subject.next('world');
    subject.next('hello again');

    expect(spy.mock.calls).toEqual([['hello'], ['world'], ['hello again']]);
  });
});
