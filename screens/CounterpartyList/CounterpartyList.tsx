import { observer } from 'mobx-react-lite';

import { CounterpartyList } from '#modules/counterparty/features/CounterpartyList';
import { PageContent } from '#shared/components/PageContent';
import { PageHeader } from '#shared/components/PageHeader';
import { PageLayout } from '#shared/components/PageLayout';

export const CounterpartyListScreen = observer(() => {
  return (
    <PageLayout
      header={<PageHeader title="Контрагенты" />}
      content={
        <PageContent>
          <CounterpartyList />
        </PageContent>
      }
    />
  );
});
