import { observer } from 'mobx-react-lite';

import { ConfirmDialog } from '#shared/components/ConfirmDialog';
import { DataGridInfinite } from '#shared/components/DataGridInfinite';
import { useStore } from '#shared/hooks/useStore';

import { Wrapper } from './styles';
import { createUIStore } from './UIStore';

export const DocumentList = observer(() => {
  const {
    list,
    columns,
    retry,
    loadMore,
    isEndReached,
    status,
    sorting,
    sort,
    deleteDialogProps,
  } = useStore(createUIStore);

  return (
    <Wrapper>
      <DataGridInfinite
        keyId="id"
        rows={list}
        columns={columns}
        onRetry={retry}
        onEndReached={loadMore}
        isEndReached={isEndReached}
        sorting={sorting}
        onSort={sort}
        {...status}
      />
      <ConfirmDialog {...deleteDialogProps} />
    </Wrapper>
  );
});
