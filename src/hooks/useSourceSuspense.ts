import * as React from 'react';

import { useForceUpdate } from './useForceUpdate';
import { useSubscription } from './useSubscription';

import { Resource } from '../resource';

export const useSourceSuspense = <T, R extends T = T>(resource: Resource<T, R>): R => {
  const resourceValue = resource.read();
  const forceUpdate = useForceUpdate();
  const [state, setState] = React.useState<R>(resourceValue);

  useSubscription(resource.subject.source, value => {
    if (value) {
      return setState(value.current);
    }

    forceUpdate();
  });

  return state;
};
