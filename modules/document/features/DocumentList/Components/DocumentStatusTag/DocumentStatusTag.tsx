import { Tag } from '@astral/ui';

import { type FormattedDocument } from '#modules/document/domain/apiFormatters/formatDocumentFromDTO';

import { DOCUMENT_STATUS_COLORS } from '../../constants';

type Props = {
  status: FormattedDocument['status'];
  label: FormattedDocument['statusLabel'];
};

const DocumentStatusTag = ({ status, label }: Props) => {
  return <Tag color={DOCUMENT_STATUS_COLORS[status]} label={label} />;
};

export const renderDocumentStatus = (document: FormattedDocument) => (
  <DocumentStatusTag status={document.status} label={document.statusLabel} />
);
