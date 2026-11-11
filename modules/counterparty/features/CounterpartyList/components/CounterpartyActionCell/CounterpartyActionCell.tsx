import { observer } from 'mobx-react-lite';

import {
  DataGridActionCell,
  DataGridSecondaryActions,
} from '#shared/components/DataGridActionCell';

import { type CounterpartyActionCellProps } from './types';
import { useLogic } from './useLogic';

// Меню открывается лениво. Его собственный observer отслеживает pending.
const SecondaryActions = observer((props: CounterpartyActionCellProps) => {
  const { secondaryActionsProps } = useLogic(props);

  return <DataGridSecondaryActions {...secondaryActionsProps} />;
});

export const CounterpartyActionCell = (props: CounterpartyActionCellProps) => (
  <DataGridActionCell
    row={props.row}
    secondaryActions={() => <SecondaryActions {...props} />}
  />
);
