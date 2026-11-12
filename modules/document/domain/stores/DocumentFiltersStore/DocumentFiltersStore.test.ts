import { describe, expect, it } from 'vitest';

import { DocumentStatus } from '#api/dto/document';
import { createRouterMock } from '#shared/tests/RouterMock';

import { createDocumentFiltersStore } from './DocumentFiltersStore';

type InitialSearchParams = Parameters<
  typeof createRouterMock
>[0]['initialSearchParams'];

const setup = (initialSearchParams?: InitialSearchParams) => {
  const router = createRouterMock({
    initialLocation: { pathname: '/documents' },
    initialSearchParams,
  });
  const sut = createDocumentFiltersStore(router);

  return { sut, router };
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

  it('Восстанавливает фильтры из search params', () => {
    const { sut } = setup({
      search: 'Договор',
      status: DocumentStatus.Sent,
      counterpartyId: 'counterparty-id',
    });

    expect(sut.filters).toEqual({
      search: 'Договор',
      status: DocumentStatus.Sent,
      counterpartyId: 'counterparty-id',
    });
  });

  it('Сохраняет выбранные фильтры в search params', () => {
    const { sut, router } = setup();

    sut.setSearch('Договор');
    sut.setStatus(DocumentStatus.Draft);
    sut.setCounterpartyId('counterparty-id');

    expect(router.searchParams).toEqual({
      search: 'Договор',
      status: DocumentStatus.Draft,
      counterpartyId: 'counterparty-id',
    });
  });
});
