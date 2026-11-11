import { type CounterpartyActionCellProps } from './types';

export const useLogic = ({ row, getActions }: CounterpartyActionCellProps) => ({
  secondaryActionsProps: { actions: getActions(row) },
});
