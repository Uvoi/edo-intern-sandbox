import { type DocumentDTO } from '#api/dto/document';
import { type TagColor } from '#shared/components/Tag';

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
