import { describe, expect, it } from 'vitest';

import { DocumentStatus } from '#api/dto/document';

import { canDeleteDocument } from './canDeleteDocument';

describe('canDeleteDocument', () => {
  it('Документ можно удалить в статусе черновика', () => {
    expect(canDeleteDocument({ status: DocumentStatus.Draft })).toBe(true);
  });

  it.each(
    Object.values(DocumentStatus).filter(
      (status) => status !== DocumentStatus.Draft,
    ),
  )('Документ нельзя удалить в статусе %s', (status) => {
    expect(canDeleteDocument({ status })).toBe(false);
  });
});
