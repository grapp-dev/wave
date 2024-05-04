/* eslint-disable @typescript-eslint/ban-types */
import { Subject, TypeOfSource } from 'wonka';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type BehaviorSubject<T> = Prettify<
  Subject<T> & {
    value: T;
  }
>;

export type TypeOfSourceArray<T extends readonly [...any[]]> = T extends [infer Head, ...infer Tail]
  ? [TypeOfSource<Head>, ...TypeOfSourceArray<Tail>]
  : [];
