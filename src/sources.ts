import { combine, concat, fromValue, interval, makeSubject, map, pipe, Source, take } from 'wonka';

import { BehaviorSubject, TypeOfSourceArray } from './types';

export const timer = (ms: number) => {
  return pipe(interval(ms), take(1));
};

export const forkJoin = <T extends Source<any>[]>(...sources: T): Source<TypeOfSourceArray<T>> => {
  return pipe(combine(...sources), take(1));
};

export const makeBehaviorSubject = <T>(value: T): BehaviorSubject<T> => {
  let currentValue = value;

  const subject = makeSubject<T>();
  const initialValue = pipe(
    fromValue(value),
    map(_ => currentValue),
  );
  const source = concat([initialValue, subject.source]);

  return {
    source,
    next(value: T) {
      if (value !== currentValue) {
        currentValue = value;
        subject.next(value);
      }
    },
    complete() {
      subject.complete();
    },
    get value() {
      return currentValue;
    },
  };
};
