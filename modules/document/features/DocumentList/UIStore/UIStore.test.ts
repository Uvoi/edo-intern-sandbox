import { when } from 'mobx';
import { describe, expect, it, vi } from 'vitest';

import { type DocumentDTO } from '#api/dto/document';
import { documentFaker } from '#api/fakers/document';
import { type DocumentFetcher } from '#api/fetchers/document';
import { createCacheService } from '#api/services/CacheService';
import { ApiHTTPError } from '#api/services/MainApiHttpClient';
import { DocumentFiltersStore } from '#modules/document/domain/stores/DocumentFiltersStore';
import { mockFetcher } from '#shared/tests/mockFetcher';

import { formatDocumentFromDTO } from '../utils/formatDocumentFromDTO';
import { UIStore } from './UIStore';

type GetDocumentList = (
  params?: DocumentDTO.DocumentListInput,
) => Promise<DocumentDTO.DocumentList>;

type DocumentListFilters = Omit<
  DocumentDTO.DocumentListInput,
  'offset' | 'count'
>;

const setup = (getDocumentList: GetDocumentList) => {
  const cacheService = createCacheService();

  const documentFetcherMock = mockFetcher<DocumentFetcher>({
    infiniteQueries: {
      documentList: cacheService.createInfiniteQuerySet(
        (params: DocumentListFilters) => ({
          execute: ({ offset, count }) =>
            getDocumentList({ offset, count, ...params }).then(
              ({ data }) => data,
            ),
        }),
      ),
    },
  });

  const filtersStore = new DocumentFiltersStore();
  const renderDocumentStatusTagSpy = vi.fn();
  const sut = new UIStore(
    documentFetcherMock,
    filtersStore,
    renderDocumentStatusTagSpy,
  );

  return { sut, filtersStore, renderDocumentStatusTagSpy };
};

describe('UIStore', () => {
  it('Список запрашивается с search из поля поиска без пробелов по краям', async () => {
    const getDocumetListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, filtersStore } = setup(getDocumetListSpy);

    filtersStore.setSearch('  Ромашка ');

    await when(() => Boolean(sut.list.length));

    expect(getDocumetListSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'Ромашка',
      }),
    );
  });

  it('Список запрашивается без search, если поле поиска состоит из пробелов', async () => {
    const getDocumetListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, filtersStore } = setup(getDocumetListSpy);

    filtersStore.setSearch('   ');
    await when(() => Boolean(sut.list.length));

    expect(getDocumetListSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: undefined,
      }),
    );
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

  it('Форматирует документы, полученные с сервера', async () => {
    const document = documentFaker.makeDocument();

    const getDocumentListSpy = vi.fn<GetDocumentList>().mockResolvedValue({
      data: [document],
      meta: { totalCount: 1 },
    });
    const { sut } = setup(getDocumentListSpy);

    await when(() => Boolean(sut.list.length));

    expect(sut.list[0]).toEqual(formatDocumentFromDTO(document));
  });

  it('Передает подготовленные параметры в рендерер статуса', () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, renderDocumentStatusTagSpy } = setup(getDocumentListSpy);
    const formattedDocument = formatDocumentFromDTO(
      documentFaker.makeDocument(),
    );
    const statusColumn = sut.columns[4];

    if ('renderCell' in statusColumn) {
      statusColumn.renderCell?.(formattedDocument);
    }

    expect(renderDocumentStatusTagSpy).toHaveBeenCalledWith({
      color: formattedDocument.statusColor,
      label: formattedDocument.statusLabel,
    });
  });

  it('Загружает следующую страницу документов', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 30 }));
    const { sut } = setup(getDocumentListSpy);

    await when(() => sut.list.length === 30);

    sut.loadMore();

    await vi.waitFor(() => expect(getDocumentListSpy).toHaveBeenCalledTimes(2));

    expect(getDocumentListSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        offset: 30,
        count: 30,
      }),
    );
  });

  it('Не загружает следующую страницу, если список закончился', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));

    const { sut } = setup(getDocumentListSpy);

    await when(() => sut.list.length === 1);

    await when(() => sut.isEndReached);

    sut.loadMore();

    expect(getDocumentListSpy).toHaveBeenCalledTimes(1);
  });

  it('Повторно загружает документы после ошибки первой загрузки', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockRejectedValueOnce(new Error('Ошибка сервера'))
      .mockResolvedValueOnce(documentFaker.makeDocumentList({ length: 1 }));

    const { sut } = setup(getDocumentListSpy);

    await when(() => {
      void sut.list;
      return sut.status.isError;
    });

    expect(sut.status.errorMsg).toBe('Ошибка сервера');

    sut.retry();

    await when(() => sut.list.length === 1);

    expect(getDocumentListSpy).toHaveBeenCalledTimes(2);
    expect(sut.status.isError).toBe(false);
  });

  it('Отображает ошибку первоначальной загрузки', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockRejectedValue(new Error('Сервер недоступен'));

    const { sut } = setup(getDocumentListSpy);

    await when(() => {
      void sut.list;
      return sut.status.isError;
    });

    expect(sut.status).toEqual({
      isLoading: false,
      isError: true,
      errorMsg: 'Сервер недоступен',
    });
  });

  it('Отображает ошибку загрузки следующей страницы', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValueOnce(documentFaker.makeDocumentList({ length: 30 }))
      .mockRejectedValueOnce(
        new Error('Не удалось загрузить следующую страницу'),
      );

    const { sut } = setup(getDocumentListSpy);

    await when(() => sut.list.length === 30);

    sut.loadMore();

    await when(() => sut.status.isError);

    expect(sut.status.errorMsg).toBe('Не удалось загрузить следующую страницу');

    expect(sut.list).toHaveLength(30);
  });

  it('Повторно загружает следующую страницу после ошибки', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValueOnce(documentFaker.makeDocumentList({ length: 30 }))
      .mockRejectedValueOnce(new Error('Ошибка загрузки страницы'))
      .mockResolvedValueOnce(documentFaker.makeDocumentList({ length: 1 }));

    const { sut } = setup(getDocumentListSpy);

    await when(() => sut.list.length === 30);

    sut.loadMore();

    await when(() => sut.status.isError && !sut.status.isLoading);

    sut.retry();

    await vi.waitFor(() => {
      expect(getDocumentListSpy).toHaveBeenCalledTimes(3);
    });

    await when(() => sut.list.length === 31);

    expect(getDocumentListSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        offset: 30,
        count: 30,
      }),
    );

    expect(sut.status.isError).toBe(false);
  });
});
