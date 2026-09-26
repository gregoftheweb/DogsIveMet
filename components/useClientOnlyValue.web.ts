import React from 'react';

// `useEffect` is not invoked during server rendering, meaning
// we can use this to determine if we're on the server or not.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const [value, setValue] = React.useState<S | C>(server);
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: defers to the client value only after mount/hydration, to avoid an SSR/client markup mismatch. This is the whole point of the hook.
    setValue(client);
  }, [client]);

  return value;
}
