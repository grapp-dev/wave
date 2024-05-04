import { makeSubject } from 'wonka';

import { useLazy } from './useLazy';

export const useSubject = <T>() => {
  return useLazy(() => {
    return makeSubject<T>();
  });
};
