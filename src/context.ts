import * as React from 'react';

import isEqual from 'react-fast-compare';
import { filter, map, pipe, scan, Source } from 'wonka';

import { useBehaviorSubject, useSource, useSourceState } from './hooks';
import { useFirstMount } from './hooks/useFirstMount';
import { useLazy } from './hooks/useLazy';
import { makeBehaviorSubject } from './sources';

const symbol = Symbol();

type WaveContextValue<T> = {
  [symbol]: {
    source: Source<T>;
    getValue: () => T;
  };
};

type WaveProviderProps<T> = React.PropsWithChildren<{
  value: T;
}>;

const makeProvider = <T>(Provider: React.Provider<WaveContextValue<T>>) => {
  const ContextProvider = (props: WaveProviderProps<T>) => {
    const { value, children } = props;

    const subject = useBehaviorSubject(value);
    const valueRef = React.useRef<WaveContextValue<T>>();
    const isFirstMount = useFirstMount();

    if (!valueRef.current) {
      valueRef.current = {
        [symbol]: {
          source: subject.source,
          getValue: () => {
            return subject.value;
          },
        },
      };
    }

    React.useEffect(() => {
      if (!isFirstMount) {
        subject.next(value);
      }
    }, [value]);

    return React.createElement(Provider, { value: valueRef.current }, children);
  };

  return ContextProvider;
};

export const createContext = <T>(value: T) => {
  const subject = makeBehaviorSubject<T>(value);
  const context = React.createContext<WaveContextValue<T>>({
    [symbol]: {
      source: subject.source,
      getValue: () => {
        return subject.value;
      },
    },
  });

  // @ts-expect-error: this_is_fine.png
  context.Provider = makeProvider(context.Provider);

  return context as unknown as React.Context<T>;
};

export const useContextSelector = <A, B>(
  context: React.Context<A>,
  selectorFn: (value: A) => B,
) => {
  const subject = React.useContext(context as unknown as React.Context<WaveContextValue<A>>)[
    symbol
  ];

  if (!subject) {
    throw new Error('[Wave] useContextSelector requires a special context');
  }

  const initialValue = useLazy(subject.getValue);
  const selectedValue = selectorFn(initialValue);

  const source = useSource(() => {
    return pipe(
      subject.source,
      map(selectorFn),
      scan(
        (acc, value) => {
          acc.prev = acc.current;
          acc.current = value;
          return acc;
        },
        {
          prev: undefined as B,
          current: selectedValue,
        },
      ),
      filter(obj => {
        return !isEqual(obj.prev, obj.current);
      }),
      map(obj => obj.current),
    );
  });

  return useSourceState(source, selectedValue);
};
