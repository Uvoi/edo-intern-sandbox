import { type DocumentStatus } from '#api/dto/document';

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  Draft: 'Черновик',
  Sent: 'Отправлен',
  Delivered: 'Доставлен',
  Signed: 'Подписан',
  Rejected: 'Отклонен',
};
