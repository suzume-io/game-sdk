import React from "react";

export function useAsyncInitialize<T>(func: () => Promise<T>, deps: any[] = []) {
  const [state, setState] = React.useState<T | undefined>();

  React.useEffect(() => {
    (async () => {
      setState(await func());
    })();
  }, deps);

  return state;
}
