/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';

import { Source } from 'wonka';

import { useBehaviorSubject } from './useBehaviorSubject';
import { useFirstMount } from './useFirstMount';
import { useLazy } from './useLazy';

export function useSource<T>(initFn: () => Source<T>): Source<T>;
export function useSource<T, P extends any[]>(
  initFn: (source: Source<P>) => Source<T>,
  inputs: [...P],
): Source<T>;

export function useSource<T, P extends any[]>(
  initFn: (() => Source<T>) | ((source: Source<P>) => Source<T>),
  inputs?: [...P],
) {
  if (!inputs) {
    return useLazy(initFn as () => Source<T>);
  }

  const subject = useBehaviorSubject(inputs);

  const source = useLazy(() => {
    return initFn(subject.source);
  });

  const isFirstMount = useFirstMount();

  React.useEffect(() => {
    if (!isFirstMount) {
      subject.next(inputs);
    }
  }, inputs);

  return source;
}
