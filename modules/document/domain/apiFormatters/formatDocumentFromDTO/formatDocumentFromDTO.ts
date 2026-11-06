import { type DocumentDTO } from '#api/dto/document';

import { DOCUMENT_STATUS_LABELS } from '../../constants';

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
): string => {
  return `${counterparty.name} (${counterparty.inn})`;
};

const formatStatusLabel = (status: DocumentDTO.Document['status']): string => {
  return DOCUMENT_STATUS_LABELS[status];
};

export const formatDocumentFromDTO = (doc: DocumentDTO.Document) => {
  return {
    id: doc.id,
    number: doc.number,
    name: doc.name,
    type: doc.type,
    status: doc.status,
    statusLabel: formatStatusLabel(doc.status),
    counterparty: formatCounterparty(doc.counterparty),
    sum: formatSum(doc.sum),
    createdAt: formatDate(doc.createdAt),
  };
};

export type FormattedDocument = ReturnType<typeof formatDocumentFromDTO>;
