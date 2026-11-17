import { type DocumentDTO, DocumentStatus } from '#api/dto/document';

export const canDeleteDocument = (
  document: Pick<DocumentDTO.Document, 'status'>,
) => document.status === DocumentStatus.Draft;
