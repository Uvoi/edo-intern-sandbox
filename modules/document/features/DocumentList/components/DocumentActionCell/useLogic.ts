import { type DocumentActionCellProps } from './types';

export const useLogic = ({ row, getActions }: DocumentActionCellProps) => ({
  secondaryActionsProps: { actions: getActions(row) },
});
