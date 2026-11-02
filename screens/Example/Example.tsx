import { observer } from 'mobx-react-lite';

import { PageContent } from '#shared/components/PageContent';
import { PageHeader } from '#shared/components/PageHeader';
import { PageLayout } from '#shared/components/PageLayout';

export const ExampleScreen = observer(() => {
  return (
    <PageLayout
      header={<PageHeader title="ЭДО Песочница" />}
      content={
        <PageContent>
          Учебный проект на стеке Astral.Frontend. Эталонный пример — раздел
          «Контрагенты», задание — в README.md.
        </PageContent>
      }
    />
  );
});
