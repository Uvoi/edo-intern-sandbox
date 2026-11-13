import { observer } from 'mobx-react-lite';

import {
  DataGridActionCell,
  DataGridSecondaryActions,
} from '#shared/components/DataGridActionCell';

import { type DocumentActionCellProps } from './types';
import { useLogic } from './useLogic';

const SecondaryActions = observer((props: DocumentActionCellProps) => {
  const { secondaryActionsProps } = useLogic(props);

  return <DataGridSecondaryActions {...secondaryActionsProps} />;
});

export const DocumentActionCell = (props: DocumentActionCellProps) => (
  <DataGridActionCell
    row={props.row}
    secondaryActions={() => <SecondaryActions {...props} />}
  />
);
