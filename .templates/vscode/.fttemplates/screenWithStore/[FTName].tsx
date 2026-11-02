import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { PageLayout } from '@example/shared';

import { createUIStore } from './UIStore';

export const <FTName | pascalcase>Screen = observer(() => {
  const [store] = useState(createUIStore);

  return (
    <PageLayout
      header={{ title: '' }}
      content={{ children: null, isPaddingDisabled: false }}
    />
  );
});
