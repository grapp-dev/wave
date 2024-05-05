import * as React from 'react';

import { Source } from 'wonka';

import { useBehaviorSubject } from './useBehaviorSubject';
import { useLazy } from './useLazy';

export function useSourceRef<T>(initialValue: T): [Source<T>, React.MutableRefObject<T>];
export function useSourceRef<T>(initialValue: T | null): [Source<T>, React.RefObject<T>];
export function useSourceRef<T = undefined>(
  initialValue?: T,
): [Source<T | undefined>, React.MutableRefObject<T | undefined>];

export function useSourceRef<T>(
  initialValue?: T,
): [Source<T | undefined>, React.MutableRefObject<T | undefined>] {
  const subject = useBehaviorSubject(initialValue);
  const ref = useLazy<React.MutableRefObject<T | undefined>>(() => {
    return {
      get current(): T | undefined {
        return subject.value;
      },
      set current(value: T | undefined) {
        subject.next(value);
      },
    };
  });
  return [subject.source, ref];
}
