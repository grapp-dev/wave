import * as React from 'react';

export const useLazy = <T>(lazyFn: () => T) => {
  return React.useState(lazyFn)[0];
};
