import * as React from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';

import { afterEach, describe, expect, it } from 'bun:test';

import { createContext, useContextSelector } from '../src';

type Result = {
  renderCount: {
    counter: number;
    label: number;
  };
};

type Context = {
  counter: number;
  label: string;
  update: React.Dispatch<React.SetStateAction<Pick<Context, 'label' | 'counter'>>>;
};

const makeContext = () => {
  const result: Result = {
    renderCount: {
      counter: 0,
      label: 0,
    },
  };

  const Context = createContext<Context>({
    counter: 0,
    label: '',
    update: () => {
      //
    },
  });

  const Counter = React.memo(() => {
    const [counter, update] = useContextSelector(Context, ctx => {
      return [ctx.counter, ctx.update];
    });
    const handleUpdate = React.useCallback(() => {
      update(obj => {
        return {
          ...obj,
          counter: obj.counter + 1,
        };
      });
    }, [update]);

    result.renderCount.counter = result.renderCount.counter + 1;

    return (
      <div>
        <span data-testid="counter">{counter}</span>
        <button type="button" data-testid="counter-button" onClick={handleUpdate}>
          +1
        </button>
      </div>
    );
  });

  const Label = React.memo(() => {
    const [label, update] = useContextSelector(Context, ctx => {
      return [ctx.label, ctx.update];
    });
    const handleUpdate = React.useCallback(() => {
      update(obj => {
        return {
          ...obj,
          label: 'world',
        };
      });
    }, [update]);

    result.renderCount.label = result.renderCount.label + 1;
    return (
      <div>
        <span data-testid="label">{label}</span>
        <button type="button" data-testid="label-button" onClick={handleUpdate}>
          +1
        </button>
      </div>
    );
  });

  const Component = () => {
    const [initialState, setState] = React.useState({ counter: 1, label: 'hello' });

    const value = {
      ...initialState,
      update: setState,
    };

    return (
      <Context.Provider value={value}>
        <Counter />
        <Label />
      </Context.Provider>
    );
  };

  return [Component, result] as const;
};

describe('Context', () => {
  afterEach(cleanup);

  it('', () => {
    const [Component, result] = makeContext();
    const { getByTestId } = render(<Component />);

    expect(result.renderCount.counter).toBe(1);
    expect(result.renderCount.label).toBe(1);

    expect(getByTestId('counter').textContent).toBe('1');
    expect(getByTestId('label').textContent).toBe('hello');

    fireEvent.click(getByTestId('counter-button'));

    expect(result.renderCount.counter).toBe(2);
    expect(result.renderCount.label).toBe(1);

    expect(getByTestId('counter').textContent).toBe('2');
    expect(getByTestId('label').textContent).toBe('hello');

    fireEvent.click(getByTestId('label-button'));

    expect(result.renderCount.counter).toBe(2);
    expect(result.renderCount.label).toBe(2);

    expect(getByTestId('counter').textContent).toBe('2');
    expect(getByTestId('label').textContent).toBe('world');
  });
});
