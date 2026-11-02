import { type DocumentDTO } from '../dto/document';
import { mainApiHttpClient } from '../services/MainApiHttpClient';

export const documentEndpoints = {
  getDocumentList: (params: DocumentDTO.DocumentListInput) =>
    mainApiHttpClient.get<DocumentDTO.DocumentList>('/document/list', {
      params,
    }),

  getDocumentStatistics: (params?: DocumentDTO.StatisticsInput) =>
    mainApiHttpClient.get<DocumentDTO.Statistics>('/document/statistics', {
      params,
    }),

  createDocument: (params: DocumentDTO.CreateInput) =>
    mainApiHttpClient.post<DocumentDTO.Document>('/document', params),

  deleteDocument: ({ id }: DocumentDTO.DeleteInput) =>
    mainApiHttpClient.delete(`/document/${id}`),
};
