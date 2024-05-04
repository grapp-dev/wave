import * as React from 'react';

import { pipe, Source, subscribe, Subscription } from 'wonka';

import { useFirstMount } from './useFirstMount';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export const useSubscription = <T>(
  source: Source<T>,
  nextFn?: (value: T) => void,
): React.MutableRefObject<Subscription> => {
  const subscriptionRef = React.useRef<Subscription>(undefined as unknown as Subscription);
  const sourceRef = React.useRef(source);
  const nextRef = React.useRef(nextFn);
  const isFirstMount = useFirstMount();

  useIsomorphicLayoutEffect(() => {
    sourceRef.current = source;
    nextRef.current = nextFn;
  });

  React.useEffect(() => {
    const source = sourceRef.current;
    const subscription = pipe(
      source,
      subscribe(value => {
        nextRef.current?.(value);
      }),
    );

    subscriptionRef.current = subscription;

    return subscription.unsubscribe;
  }, [nextRef.current === nextFn && !isFirstMount, sourceRef.current === source]);

  return subscriptionRef;
};
