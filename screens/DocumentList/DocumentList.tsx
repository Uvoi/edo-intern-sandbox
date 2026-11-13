import { observer } from 'mobx-react-lite';

import { DocumentFilters } from '#modules/document/features/DocumentFilters';
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
          <DocumentFilters />
          <DocumentList />
        </PageContent>
      }
    />
  );
});
