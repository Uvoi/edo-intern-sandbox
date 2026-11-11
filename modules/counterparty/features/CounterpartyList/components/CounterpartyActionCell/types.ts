import { type CounterpartyDTO } from '#api/dto/counterparty';
import { type DataGridSecondaryActionsProps } from '#shared/components/DataGridActionCell';

export type CounterpartyActionCellProps = {
  row: CounterpartyDTO.Counterparty;
  getActions: (
    row: CounterpartyDTO.Counterparty,
  ) => NonNullable<
    DataGridSecondaryActionsProps<CounterpartyDTO.Counterparty>['actions']
  >;
};
