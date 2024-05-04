import * as React from 'react';

export const useFirstMount = () => {
  const initialRef = React.useRef(true);

  React.useEffect(() => {
    initialRef.current = false;
  }, []);

  return initialRef.current;
};
