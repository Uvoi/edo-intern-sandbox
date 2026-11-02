import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { createUIStore } from './UIStore';

export const <FTName | pascalcase> = observer(() => {
  const [store] = useState(createUIStore);

  return ();
});
