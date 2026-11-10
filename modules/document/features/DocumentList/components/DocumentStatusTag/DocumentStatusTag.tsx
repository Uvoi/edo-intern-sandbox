import { Tag } from '#shared/components/Tag';

import { type FormattedDocument } from '../../utils/formatDocumentFromDTO';

export type DocumentStatusTagProps = {
  color: FormattedDocument['statusColor'];
  label: FormattedDocument['statusLabel'];
};

export const DocumentStatusTag = ({ color, label }: DocumentStatusTagProps) => (
  <Tag color={color} label={label} />
);
