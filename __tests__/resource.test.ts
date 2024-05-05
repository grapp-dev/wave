import { describe, expect, it } from 'bun:test';

import { makeBehaviorSubject, makeSubject, Resource } from '../src';

describe('Resource', () => {
  it('should unsubscribe source when destroy during initial success state', () => {
    const subject = makeBehaviorSubject(1);
    const resource = new Resource(subject.source);
    expect(resource.read()).toBe(1);
    expect(resource.isDestroyed).toBe(false);

    resource.destroy();

    subject.next(2);
    expect(resource.read()).toBe(1);
    expect(resource.isDestroyed).toBe(true);
  });

  it('should unsubscribe source when destroy during success state', () => {
    const subject = makeSubject<number>();
    const resource = new Resource(subject.source);
    expect(() => resource.read()).toThrow(Promise);

    subject.next(1);
    expect(resource.read()).toBe(1);

    resource.destroy();

    subject.next(2);
    expect(resource.read()).toBe(1);
  });

  it('should result error when destroy during pending state', () => {
    const subject = makeSubject<number>();
    const resource = new Resource(subject.source);
    expect(() => resource.read()).toThrow(Promise);

    resource.destroy();

    expect(() => resource.read()).toThrow(Error);

    subject.next(2);
    expect(() => resource.read()).toThrow(Error);
  });
});
