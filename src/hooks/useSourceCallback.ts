import * as React from 'react';

import { map, pipe, Source } from 'wonka';

import { useLazy } from './useLazy';
import { useSource } from './useSource';
import { useSubject } from './useSubject';

const identity = (source: unknown) => {
  return source;
};

export function useSourceCallback<E = void>(): [Source<E>, (event: E) => void];
export function useSourceCallback<O, E extends unknown[] = [O]>(
  initFn: (source: Source<E['length'] extends infer T ? (T extends 1 ? O : E) : E>) => Source<O>,
): [Source<O>, (...events: E) => void];

export function useSourceCallback<O, E extends unknown[]>(
  initFn = identity as (source: Source<E>) => Source<O>,
): readonly [Source<O>, (...args: E) => void] {
  const subject = useSubject<E>();
  const main = useSource(() => {
    return pipe(
      subject.source,
      map(args => {
        return args.length === 1 ? (args[0] as E) : args;
      }),
    );
  });
  const source = useLazy(() => {
    return initFn(main);
  });

  const callbackFn = React.useCallback((...args: E) => {
    subject.next(args);
  }, []);

  return [source, callbackFn] as const;
}
