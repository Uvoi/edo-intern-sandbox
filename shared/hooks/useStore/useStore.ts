import { useState } from 'react';

export const useStore = <TStore extends object>(
  store: TStore | (() => TStore),
): TStore => {
  const [state] = useState(store);

  return state;
};
