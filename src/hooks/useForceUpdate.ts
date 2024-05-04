import * as React from 'react';

const increment = (n: number): number => {
  return (n + 1) % 1000000;
};

export const useForceUpdate = () => {
  const [, update] = React.useState(0);
  return React.useCallback(() => {
    update(increment);
  }, []);
};
