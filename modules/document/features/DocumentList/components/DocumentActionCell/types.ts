import { type DataGridSecondaryActionsProps } from '#shared/components/DataGridActionCell';

import { type FormattedDocument } from '../../utils/formatDocumentFromDTO';

export type DocumentActionCellProps = {
  row: FormattedDocument;
  getActions: (
    row: FormattedDocument,
  ) => NonNullable<DataGridSecondaryActionsProps<FormattedDocument>['actions']>;
};
