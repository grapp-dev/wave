import * as React from 'react';

import { Source } from 'wonka';

import { useLazy } from './useLazy';

import { Resource } from '../resource';

export const useResource = <T, R extends T = T>(
  source: Source<T>,
  isSuccess?: T extends R ? (value: T) => boolean : (value: T) => value is R,
): Resource<T, R> => {
  const resource = useLazy(() => {
    return new Resource(source, isSuccess);
  });

  React.useEffect(() => {
    return () => {
      if (!resource.isDestroyed) {
        resource.destroy();
      }
    };
  }, [resource]);

  return resource;
};
