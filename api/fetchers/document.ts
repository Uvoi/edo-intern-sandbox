import { type DocumentDTO } from '../dto/document';
import { fakeDocumentEndpoints } from '../fakers/endpoints/document';
import { cacheService } from '../services/CacheService';

// Contract First: пока нет backend, данные отдает stub из fakers.
// Когда появится API — заменить fakeDocumentEndpoints на documentEndpoints
export const documentFetcher = {
  infiniteQueries: {
    documentList: cacheService.createInfiniteQuerySet(
      (params: Omit<DocumentDTO.DocumentListInput, 'offset' | 'count'>) => ({
        execute: ({ offset, count }) =>
          fakeDocumentEndpoints
            .getDocumentList({ offset, count, ...params })
            .then(({ data }) => data.data),
      }),
    ),
  },
  queries: {
    documentStatistics: cacheService.createQuerySet(
      (params?: DocumentDTO.StatisticsInput) => ({
        execute: () =>
          fakeDocumentEndpoints
            .getDocumentStatistics(params)
            .then(({ data }) => data),
      }),
    ),
  },
  mutations: {
    createDocument: cacheService.createMutationSet(
      (params: DocumentDTO.CreateInput) =>
        fakeDocumentEndpoints.createDocument(params).then(({ data }) => data),
    ),
    deleteDocument: cacheService.createMutationSet(
      (params: DocumentDTO.DeleteInput) =>
        fakeDocumentEndpoints.deleteDocument(params),
    ),
  },
};

export type DocumentFetcher = typeof documentFetcher;
