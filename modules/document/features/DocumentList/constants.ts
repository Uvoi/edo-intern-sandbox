import { type TagColor } from '@astral/ui';

import { type DocumentDTO } from '#api/dto/document';

export const DOCUMENT_STATUS_COLORS: Record<
  DocumentDTO.Document['status'],
  TagColor
> = {
  Draft: 'grey',
  Sent: 'default',
  Delivered: 'primary',
  Signed: 'success',
  Rejected: 'error',
};
