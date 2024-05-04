import * as React from 'react';

import { Source } from 'wonka';

import { useLazy } from './useLazy';
import { useSubject } from './useSubject';

const identity = (source: unknown) => {
  return source;
};

export function useSourceCallback<E = void>(): [Source<E>, (event: E) => void];
export function useSourceCallback<O, E = O>(
  initFn: (source: Source<E>) => Source<O>,
): [Source<O>, (event: E) => void];
export function useSourceCallback<O = undefined, E = O, P extends any[] = [E]>(
  initFn: (source: Source<E>) => Source<O>,
  selectorFn: (...args: P) => E,
): [Source<O>, (...args: P) => void];

export function useSourceCallback<O = undefined, E = O, P extends any[] = [E]>(
  initFn = identity as (source: Source<E>) => Source<O>,
  selectorFn?: (...args: P) => O,
): readonly [Source<O>, (...args: P) => void] {
  const subject = useSubject<E>();
  const source = useLazy(() => {
    return initFn(subject.source);
  });

  const callbackFn = React.useCallback((...args: P) => {
    subject.next(typeof selectorFn === 'function' ? selectorFn(...args) : args[0]);
  }, []);

  return [source, callbackFn] as const;
}
