import { useLazy } from './useLazy';

import { makeBehaviorSubject } from '../sources';

export const useBehaviorSubject = <T>(initialValue: T) => {
  return useLazy(() => {
    return makeBehaviorSubject<T>(initialValue);
  });
};
