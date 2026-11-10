import { describe, expect, it } from 'vitest';

import { DocumentStatus } from '#api/dto/document';

import { DocumentFiltersStore } from './DocumentFiltersStore';

const setup = () => {
  const sut = new DocumentFiltersStore();

  return { sut };
};

describe('DocumentFiltersStore', () => {
  it('Возвращает выбранные фильтры', () => {
    const { sut } = setup();

    sut.setSearch('Договор');
    sut.setStatus(DocumentStatus.Draft);
    sut.setCounterpartyId('counterparty-id');

    expect(sut.filters).toEqual({
      search: 'Договор',
      status: DocumentStatus.Draft,
      counterpartyId: 'counterparty-id',
    });
  });

  it('Убирает пробелы по краям поисковой строки', () => {
    const { sut } = setup();

    sut.setSearch('  Договор  ');

    expect(sut.filters.search).toBe('Договор');
  });

  it('Не передает пустую поисковую строку', () => {
    const { sut } = setup();

    sut.setSearch('   ');

    expect(sut.filters.search).toBeUndefined();
  });

  it('Сбрасывает фильтры', () => {
    const { sut } = setup();

    sut.setSearch('Договор');
    sut.setStatus(DocumentStatus.Draft);
    sut.setCounterpartyId('counterparty-id');

    sut.reset();

    expect(sut.filters).toEqual({
      search: undefined,
      status: undefined,
      counterpartyId: undefined,
    });
  });
});
