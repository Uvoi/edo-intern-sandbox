import { when } from 'mobx';
import { describe, expect, it, vi } from 'vitest';

import { type CounterpartyDTO } from '#api/dto/counterparty';
import { DocumentStatus } from '#api/dto/document';
import { counterpartyFaker } from '#api/fakers/counterparty';
import { type CounterpartyFetcher } from '#api/fetchers/counterparty';
import { createCacheService } from '#api/services/CacheService';
import { createDocumentFiltersStore } from '#modules/document/domain/stores/DocumentFiltersStore';
import { mockFetcher } from '#shared/tests/mockFetcher';
import { createRouterMock } from '#shared/tests/RouterMock';

import { UIStore } from './UIStore';

type GetCounterpartyList = () => Promise<CounterpartyDTO.CounterpartyList>;

const setup = (getCounterpartyList: GetCounterpartyList) => {
  const cacheService = createCacheService();
  const filtersStore = createDocumentFiltersStore(createRouterMock({}));
  const counterpartyFetcherMock = mockFetcher<CounterpartyFetcher>({
    queries: {
      counterpartyList: cacheService.createQuerySet(() => ({
        execute: getCounterpartyList,
      })),
    },
  });
  const sut = new UIStore(filtersStore, counterpartyFetcherMock);

  return { sut, filtersStore };
};

describe('UIStore', () => {
  it('Возвращает подготовленные опции статусов', () => {
    const { sut } = setup(async () =>
      counterpartyFaker.makeCounterpartyList({ length: 0 }),
    );

    expect(sut.statusOptions).toContainEqual({
      value: DocumentStatus.Draft,
      label: 'Черновик',
    });
  });

  it('Загружает список контрагентов', async () => {
    const counterpartyList = counterpartyFaker.makeCounterpartyList({
      length: 2,
    });
    const getCounterpartyListSpy = vi
      .fn<GetCounterpartyList>()
      .mockResolvedValue(counterpartyList);
    const { sut } = setup(getCounterpartyListSpy);

    await when(() => sut.counterpartyList.length === 2);

    expect(sut.counterpartyList).toEqual(counterpartyList.data);
    expect(getCounterpartyListSpy).toHaveBeenCalledExactlyOnceWith();
  });

  it('Возвращает подпись выбранного контрагента', async () => {
    const counterparty = counterpartyFaker.makeCounterparty({
      id: 'counterparty-id',
      name: 'ООО Ромашка',
      inn: '1234567890',
    });
    const { sut } = setup(async () => ({
      data: [counterparty],
      meta: { totalCount: 1 },
    }));

    await when(() => sut.counterpartyOptions.length === 1);

    expect(sut.getCounterpartyLabel(counterparty.id)).toBe(
      'ООО Ромашка (1234567890)',
    );
  });

  it('Передает выбранного контрагента в store фильтров', () => {
    const { sut, filtersStore } = setup(async () =>
      counterpartyFaker.makeCounterpartyList({ length: 0 }),
    );

    sut.setCounterpartyId('counterparty-id');

    expect(filtersStore.counterpartyId).toBe('counterparty-id');
  });

  it('Передает поиск и статус в store фильтров', () => {
    const { sut, filtersStore } = setup(async () =>
      counterpartyFaker.makeCounterpartyList({ length: 0 }),
    );

    sut.setSearch('Договор');
    sut.setStatus(DocumentStatus.Draft);

    expect(filtersStore.search).toBe('Договор');
    expect(filtersStore.status).toBe(DocumentStatus.Draft);
  });

  it('Сбрасывает все фильтры', () => {
    const { sut, filtersStore } = setup(async () =>
      counterpartyFaker.makeCounterpartyList({ length: 0 }),
    );
    filtersStore.setSearch('Договор');
    filtersStore.setStatus(DocumentStatus.Draft);
    filtersStore.setCounterpartyId('counterparty-id');

    sut.reset();

    expect(filtersStore.filters).toEqual({
      search: undefined,
      status: undefined,
      counterpartyId: undefined,
    });
  });
});
