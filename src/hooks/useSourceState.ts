import * as React from 'react';

import { pipe, Source, subscribe } from 'wonka';

import { useLazy } from './useLazy';

export function useSourceState<T>(source: Source<T>, initialState: T): T;
export function useSourceState<T>(source: Source<T>, initialState?: T): T | undefined;

export function useSourceState<T>(source: Source<T>, initialState: T): T {
  const valueRef = React.useRef<T>(initialState);

  useLazy(() => {
    const subscription = pipe(
      source,
      subscribe(value => {
        valueRef.current = value;
      }),
    );

    subscription.unsubscribe();
  });

  const subscribeFn = React.useCallback((nextFn: () => void) => {
    const subscription = pipe(
      source,
      subscribe(value => {
        valueRef.current = value;
        nextFn();
      }),
    );

    return subscription.unsubscribe;
  }, []);

  const snapshotFn = React.useCallback(() => {
    return valueRef.current;
  }, []);

  return React.useSyncExternalStore(subscribeFn, snapshotFn, snapshotFn);
}
