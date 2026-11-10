import { type DocumentDTO } from '#api/dto/document';
import { DOCUMENT_STATUS_LABELS } from '#modules/document/domain/constants';
import { type TagColor } from '#shared/components/Tag';

import { DOCUMENT_STATUS_COLORS } from '../../constants';

const formatSum = (sumInCents: number): string => {
  const sumInRubles = sumInCents / 100;

  return sumInRubles.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  });
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString('ru-RU');
};

const formatCounterparty = (
  counterparty: DocumentDTO.Document['counterparty'],
): string => `${counterparty.name} (${counterparty.inn})`;

export type FormattedDocument = {
  id: DocumentDTO.Document['id'];
  number: DocumentDTO.Document['number'];
  name: DocumentDTO.Document['name'];
  type: DocumentDTO.Document['type'];
  status: DocumentDTO.Document['status'];
  statusLabel: string;
  statusColor: TagColor;
  counterparty: string;
  sum: string;
  createdAt: string;
};

export const formatDocumentFromDTO = (
  document: DocumentDTO.Document,
): FormattedDocument => ({
  id: document.id,
  number: document.number,
  name: document.name,
  type: document.type,
  status: document.status,
  statusLabel: DOCUMENT_STATUS_LABELS[document.status],
  statusColor: DOCUMENT_STATUS_COLORS[document.status],
  counterparty: formatCounterparty(document.counterparty),
  sum: formatSum(document.sum),
  createdAt: formatDate(document.createdAt),
});
