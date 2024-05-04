import * as React from 'react';

import { cleanup, render } from '@testing-library/react';

import { afterEach, describe, expect, it } from 'bun:test';

import {
  fromArray,
  makeBehaviorSubject,
  makeSubject,
  Resource,
  useSourceSuspense,
} from '../../src';
import { delay } from '../utils';

// TODO: fix type
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

type Result<T> = {
  current?: T | Error;
  renderCount: number;
};

const withSuspense = <T,>(resource: Resource<T>) => {
  const result: Result<T> = {
    current: undefined,
    renderCount: 0,
  };

  const Status = (props: { value: string }) => {
    return <div data-testid={props.value} />;
  };

  class ErrorBoundary extends React.Component<React.PropsWithChildren> {
    override state = { hasError: false };

    static getDerivedStateFromError(error: Error) {
      result.current = error;
      return { hasError: true };
    }

    override render() {
      return this.state.hasError ? <Status value="error" /> : this.props.children;
    }
  }

  const Child = (props: React.PropsWithChildren<{ resource: Resource<T> }>) => {
    result.renderCount = result.renderCount + 1;
    result.current = undefined;
    result.current = useSourceSuspense(props.resource);
    return <Status value="success" />;
  };

  const SuspendedComponent = () => {
    return (
      <ErrorBoundary>
        <React.Suspense fallback={<Status value="pending" />}>
          <Child resource={resource} />
        </React.Suspense>
      </ErrorBoundary>
    );
  };

  return [SuspendedComponent, result] as const;
};

const act = async (fn?: (() => Promise<void>) | (() => void)) => {
  await React.act(async () => {
    await fn?.();
    await delay();
  });
};

describe('useSourceSuspense', () => {
  afterEach(cleanup);

  it('should trigger Suspense on init when no sync value is emitted', async () => {
    const subject = makeSubject<number>();
    const resource = new Resource(subject.source);

    const [Component, result] = withSuspense(resource);
    const { queryByTestId } = render(<Component />);

    expect(result.renderCount).toBe(1);
    expect(result.current).toBeUndefined();
    expect(queryByTestId('pending')).toBeDefined();

    await act(() => {
      subject.next(1);
    });

    expect(result.renderCount).toBe(2);
    expect(result.current).toBe(1);
    expect(queryByTestId('success')).toBeDefined();
  });

  it('should not trigger Suspense on init when sync values are emitted', async () => {
    const source = fromArray([1, 2, 3, 4]);
    const resource = new Resource(source);
    const [Component, result] = withSuspense(resource);
    const { queryByTestId } = render(<Component />);

    expect(result.renderCount).toBe(1);
    expect(result.current).toBe(4);
    expect(queryByTestId('success')).toBeDefined();

    await act();

    expect(result.renderCount).toBe(1);
    expect(result.current).toBe(4);
    expect(queryByTestId('success')).toBeDefined();
  });

  it('should trigger Suspense when a non-success value is emitted during success state', async () => {
    const subject = makeBehaviorSubject<number>(1);
    const resource = new Resource(subject.source, (value: number) => {
      return value !== 2;
    });

    const [Component, result] = withSuspense(resource);
    const { queryByTestId } = render(<Component />);

    expect(result.renderCount).toBe(1);
    expect(result.current).toBe(1);
    expect(queryByTestId('success')).toBeDefined();

    await act(() => {
      subject.next(2);
    });

    expect(result.renderCount).toBe(2);
    expect(result.current).toBeUndefined();
    expect(queryByTestId('pending')).toBeDefined();

    await act(() => {
      subject.next(3);
    });

    expect(result.renderCount).toBe(3);
    expect(result.current).toBe(3);
    expect(queryByTestId('success')).toBeDefined();
  });

  it('should trigger Suspense only once when same values are emitted', async () => {
    const subject = makeSubject<number>();
    const resource = new Resource(subject.source);
    const [Component, result] = withSuspense(resource);
    const { queryByTestId } = render(<Component />);

    expect(result.renderCount).toBe(1);
    expect(result.current).toBeUndefined();
    expect(queryByTestId('pending')).toBeDefined();

    await act(() => {
      subject.next(4);
    });
    await act(() => {
      subject.next(4);
    });
    await act(() => {
      subject.next(4);
    });

    expect(result.renderCount).toBe(2);
    expect(result.current).toBe(4);
    expect(queryByTestId('success')).toBeDefined();

    await act(() => {
      subject.next(3);
    });
    await act(() => {
      subject.next(3);
    });
    await act(() => {
      subject.next(3);
    });

    expect(result.renderCount).toBe(3);
    expect(result.current).toBe(3);
    expect(queryByTestId('success')).toBeDefined();

    await act(() => {
      subject.next(6);
    });
    await act(() => {
      subject.next(5);
    });
    await act(() => {
      subject.next(5);
    });

    expect(result.renderCount).toBe(5);
    expect(result.current).toBe(5);
    expect(queryByTestId('success')).toBeDefined();
  });

  it('should not trigger Suspense when a non-success value is emitted during pending state', async () => {
    const subject = makeSubject<number>();
    const resource = new Resource(subject.source, (value: number) => {
      return value === 3;
    });

    const [Component, result] = withSuspense(resource);
    const { queryByTestId } = render(<Component />);

    expect(result.renderCount).toBe(1);
    expect(result.current).toBeUndefined();
    expect(queryByTestId('pending')).toBeDefined();

    await act(() => {
      subject.next(1);
    });

    expect(result.renderCount).toBe(1);
    expect(result.current).toBeUndefined();
    expect(queryByTestId('pending')).toBeDefined();

    await act(() => {
      subject.next(2);
    });

    expect(result.renderCount).toBe(1);
    expect(result.current).toBeUndefined();
    expect(queryByTestId('pending')).toBeDefined();

    await act(() => {
      subject.next(3);
    });

    expect(result.renderCount).toBe(2);
    expect(result.current).toBe(3);
    expect(queryByTestId('success')).toBeDefined();
  });

  it('should re-render with the latest value emitted before Component mount', () => {
    const subject = makeBehaviorSubject<number>(1);
    const resource = new Resource(subject.source);

    const [Component, result] = withSuspense(resource);
    const { queryByTestId } = render(<Component />);

    React.act(() => {
      subject.next(2);
    });

    expect(result.renderCount).toBe(2);
    expect(result.current).toBe(2);
    expect(queryByTestId('success')).toBeDefined();
  });

  it('should force update when success values are emitted during success state', async () => {
    const subject = makeBehaviorSubject<number>(1);
    const resource = new Resource(subject.source);

    const [Component, result] = withSuspense(resource);
    const { queryByTestId } = render(<Component />);

    expect(result.renderCount).toBe(1);
    expect(result.current).toBe(1);
    expect(queryByTestId('success')).toBeDefined();

    await act(() => {
      subject.next(2);
    });

    expect(result.renderCount).toBe(2);
    expect(result.current).toBe(2);
    expect(queryByTestId('success')).toBeDefined();

    await act(() => {
      subject.next(3);
    });

    expect(result.renderCount).toBe(3);
    expect(result.current).toBe(3);
    expect(queryByTestId('success')).toBeDefined();
  });

  it('should do nothing when the source completes during success state', async () => {
    const subject = makeBehaviorSubject<number>(1);
    const resource = new Resource(subject.source);

    const [Component, result] = withSuspense(resource);
    const { queryByTestId } = render(<Component />);

    expect(result.renderCount).toBe(1);
    expect(result.current).toBe(1);
    expect(queryByTestId('success')).toBeDefined();

    await act(() => {
      subject.complete();
    });

    expect(result.renderCount).toBe(1);
    expect(result.current).toBe(1);
    expect(queryByTestId('success')).toBeDefined();
  });
});
