import { observer } from 'mobx-react-lite';

import { DocumentList } from '#modules/document/features/DocumentList';
import { PageContent } from '#shared/components/PageContent';
import { PageHeader } from '#shared/components/PageHeader';
import { PageLayout } from '#shared/components/PageLayout';

export const DocumentListScreen = observer(() => {
  return (
    <PageLayout
      header={<PageHeader title="Документы" />}
      content={
        <PageContent>
          <DocumentList />
        </PageContent>
      }
    />
  );
});
