import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, FormSubmitButton } from '@example/shared';

import { createUIStore } from './UIStore';
import { useLogic } from './useLogic';

type <FTName | pascalcase>Props = {};

export const <FTName | pascalcase> = observer((props: <FTName | pascalcase>Props) => {
  const [store] = useState(() => createUIStore());

  const { form, handleFormSubmit } = useLogic(store);

  return (
    <Form form={form} onSubmit={form.handleSubmit(handleFormSubmit)}>
      <FormSubmitButton size="medium">Сабмит</FormSubmitButton>
    </Form>
  );
});
