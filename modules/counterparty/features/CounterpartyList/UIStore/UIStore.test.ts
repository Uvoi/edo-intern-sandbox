import { when } from 'mobx';
import { describe, expect, it, vi } from 'vitest';

import { type CounterpartyDTO } from '#api/dto/counterparty';
import { counterpartyFaker } from '#api/fakers/counterparty';
import { type CounterpartyFetcher } from '#api/fetchers/counterparty';
import { createCacheService } from '#api/services/CacheService';
import { ApiHTTPError } from '#api/services/MainApiHttpClient';
import { mockFetcher } from '#shared/tests/mockFetcher';

import { UIStore } from './UIStore';

type GetCounterpartyList = (
  params?: CounterpartyDTO.CounterpartyListInput,
) => Promise<CounterpartyDTO.CounterpartyList>;

const setup = (getCounterpartyList: GetCounterpartyList) => {
  const cacheService = createCacheService();

  const counterpartyFetcherMock = mockFetcher<CounterpartyFetcher>({
    queries: {
      counterpartyList: cacheService.createQuerySet(
        (params?: CounterpartyDTO.CounterpartyListInput) => ({
          execute: () => getCounterpartyList(params),
        }),
      ),
    },
  });

  const sut = new UIStore(counterpartyFetcherMock);

  return { sut };
};

describe('UIStore', () => {
  it('Список запрашивается с search из поля поиска без пробелов по краям', async () => {
    const getCounterpartyListSpy = vi
      .fn<GetCounterpartyList>()
      .mockResolvedValue(counterpartyFaker.makeCounterpartyList({ length: 1 }));
    const { sut } = setup(getCounterpartyListSpy);

    sut.setSearch('  Ромашка ');
    // Обращение к list внутри when подписывается на query и запускает загрузку,
    // так же как это делает observer-компонент
    await when(() => Boolean(sut.list.length));

    expect(getCounterpartyListSpy).toHaveBeenLastCalledWith({
      search: 'Ромашка',
    });
  });

  it('Список запрашивается без search, если поле поиска состоит из пробелов', async () => {
    const getCounterpartyListSpy = vi
      .fn<GetCounterpartyList>()
      .mockResolvedValue(counterpartyFaker.makeCounterpartyList({ length: 1 }));
    const { sut } = setup(getCounterpartyListSpy);

    sut.setSearch('   ');
    await when(() => Boolean(sut.list.length));

    expect(getCounterpartyListSpy).toHaveBeenLastCalledWith({
      search: undefined,
    });
  });

  it('Текст ошибки сервера передается в таблицу при ошибке загрузки', async () => {
    const { sut } = setup(() =>
      Promise.reject(
        new ApiHTTPError({
          errors: [{ message: 'Сервер недоступен', additionalInfo: {} }],
          config: undefined,
        }),
      ),
    );

    await when(() => sut.list.length === 0 && sut.status.isError);

    expect(sut.status.errorMsg).toBe('Сервер недоступен');
  });
});
