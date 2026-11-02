import { type documentEndpoints } from '../../_endpoints/document';
import { type DocumentDTO, DocumentStatus } from '../../dto/document';
import { faker } from '../../services/Faker';
import { documentFaker } from '../document';
import { makeFakeHttpError } from '../utils/makeFakeHttpError';
import { makeFakeHttpPromise } from '../utils/makeFakeHttpPromise';
import { getFakeCounterpartyDB } from './counterparty';

const FAKE_DELAY = 800;

const FAKE_SEED = 2026;

/**
 * Если наименование создаваемого документа содержит эту строку, «сервер» вернет ошибку.
 * Нужно, чтобы проверить обработку ошибок
 */
const FAKE_ERROR_TRIGGER = 'ошибка';

let documentDB: DocumentDTO.Document[] | undefined;

const getFakeDocumentDB = () => {
  if (!documentDB) {
    const counterpartyList = getFakeCounterpartyDB();

    faker.seed(FAKE_SEED);

    documentDB = Array.from({ length: 137 }, () =>
      documentFaker.makeDocument({
        counterparty: faker.helpers.arrayElement(counterpartyList),
      }),
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return documentDB;
};

const filterDocumentList = (
  list: DocumentDTO.Document[],
  { search, status, counterpartyId }: DocumentDTO.FilterInput,
) => {
  const normalizedSearch = search?.trim().toLowerCase();

  return list.filter(
    (document) =>
      (!normalizedSearch ||
        document.name.toLowerCase().includes(normalizedSearch) ||
        document.number.toLowerCase().includes(normalizedSearch)) &&
      (!status || document.status === status) &&
      (!counterpartyId || document.counterparty.id === counterpartyId),
  );
};

const sortDocumentList = (
  list: DocumentDTO.Document[],
  { sortField, sortOrder = 'desc' }: DocumentDTO.DocumentListInput,
) => {
  if (!sortField) {
    return list;
  }

  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...list].sort((a, b) => {
    const left = a[sortField];
    const right = b[sortField];

    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * direction;
    }

    return String(left).localeCompare(String(right)) * direction;
  });
};

/**
 * Stub-backend документов: хранит данные в памяти до перезагрузки страницы,
 * поддерживает фильтры, сортировку, пагинацию, создание и удаление
 */
export const fakeDocumentEndpoints: typeof documentEndpoints = {
  getDocumentList: (params) => {
    const filteredList = sortDocumentList(
      filterDocumentList(getFakeDocumentDB(), params),
      params,
    );

    return makeFakeHttpPromise(
      {
        data: filteredList.slice(params.offset, params.offset + params.count),
        meta: { totalCount: filteredList.length },
      },
      FAKE_DELAY,
    );
  },

  getDocumentStatistics: (params) => {
    const filteredList = filterDocumentList(getFakeDocumentDB(), params ?? {});

    const statistics = Object.values(DocumentStatus).map((status) => ({
      status,
      count: filteredList.filter((document) => document.status === status)
        .length,
    }));

    return makeFakeHttpPromise(statistics, FAKE_DELAY);
  },

  createDocument: (params) => {
    if (params.name.toLowerCase().includes(FAKE_ERROR_TRIGGER)) {
      return makeFakeHttpError(
        'Не удалось создать документ. Попробуйте позже',
        FAKE_DELAY,
      );
    }

    const counterparty = getFakeCounterpartyDB().find(
      ({ id }) => id === params.counterpartyId,
    );

    if (!counterparty) {
      return makeFakeHttpError('Контрагент не найден', FAKE_DELAY);
    }

    const document = documentFaker.makeDocument({
      name: params.name,
      type: params.type,
      sum: params.sum,
      counterparty,
      status: DocumentStatus.Draft,
      createdAt: new Date().toISOString(),
    });

    getFakeDocumentDB().unshift(document);

    return makeFakeHttpPromise(document, FAKE_DELAY);
  },

  deleteDocument: ({ id }) => {
    const db = getFakeDocumentDB();
    const index = db.findIndex((document) => document.id === id);

    if (index === -1) {
      return makeFakeHttpError('Документ не найден', FAKE_DELAY);
    }

    if (db[index].status !== DocumentStatus.Draft) {
      return makeFakeHttpError('Удалить можно только черновик', FAKE_DELAY);
    }

    db.splice(index, 1);

    return makeFakeHttpPromise(undefined, FAKE_DELAY);
  },
};
