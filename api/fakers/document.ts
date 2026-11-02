import {
  type DocumentDTO,
  DocumentStatus,
  DocumentType,
} from '../dto/document';
import { faker } from '../services/Faker';
import { counterpartyFaker } from './counterparty';

const DOCUMENT_NAME_PREFIX: Record<DocumentType, string> = {
  [DocumentType.Invoice]: 'Счёт на оплату',
  [DocumentType.Act]: 'Акт выполненных работ',
  [DocumentType.Upd]: 'УПД',
  [DocumentType.Contract]: 'Договор поставки',
};

const DOCUMENT_NUMBER_PREFIX: Record<DocumentType, string> = {
  [DocumentType.Invoice]: 'СЧ',
  [DocumentType.Act]: 'АКТ',
  [DocumentType.Upd]: 'УПД',
  [DocumentType.Contract]: 'ДГ',
};

export const documentFaker = {
  makeDocument: (
    data?: Partial<DocumentDTO.Document>,
  ): DocumentDTO.Document => {
    const type = data?.type ?? faker.helpers.enumValue(DocumentType);

    return {
      id: faker.string.uuid(),
      number: `${DOCUMENT_NUMBER_PREFIX[type]}-${faker.string.numeric(5)}`,
      name: `${DOCUMENT_NAME_PREFIX[type]} № ${faker.string.numeric(3)}`,
      type,
      status: faker.helpers.enumValue(DocumentStatus),
      counterparty: counterpartyFaker.makeCounterparty(),
      sum: faker.number.int({ min: 1000_00, max: 5_000_000_00 }),
      createdAt: faker.date.recent({ days: 90 }).toISOString(),
      ...data,
    };
  },

  makeDocumentList: ({
    length,
    totalCount,
    item,
  }: {
    length: number;
    totalCount?: number;
    item?: Partial<DocumentDTO.Document>;
  }): DocumentDTO.DocumentList => ({
    data: Array.from({ length }, () => documentFaker.makeDocument(item)),
    meta: { totalCount: totalCount ?? length },
  }),

  makeStatistics: (
    data?: Partial<Record<DocumentStatus, number>>,
  ): DocumentDTO.Statistics =>
    Object.values(DocumentStatus).map((status) => ({
      status,
      count: data?.[status] ?? faker.number.int({ min: 0, max: 50 }),
    })),
};
