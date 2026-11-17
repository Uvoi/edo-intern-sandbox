import { when } from 'mobx';
import { describe, expect, it, vi } from 'vitest';

import { type DocumentDTO, DocumentStatus } from '#api/dto/document';
import { documentFaker } from '#api/fakers/document';
import { makeFakeHttpRes } from '#api/fakers/utils/makeFakeHttpRes';
import { type DocumentFetcher } from '#api/fetchers/document';
import { createCacheService } from '#api/services/CacheService';
import { ApiHTTPError } from '#api/services/MainApiHttpClient';
import { createDocumentFiltersStore } from '#modules/document/domain/stores/DocumentFiltersStore';
import { type CopyToClipboard } from '#shared/services/Clipboard';
import { type Notify } from '#shared/services/Notification';
import { mock } from '#shared/tests/mock';
import { mockFetcher } from '#shared/tests/mockFetcher';
import { createRouterMock } from '#shared/tests/RouterMock';

import { formatDocumentFromDTO } from '../utils/formatDocumentFromDTO';
import { UIStore } from './UIStore';

type GetDocumentList = (
  params?: DocumentDTO.DocumentListInput,
) => Promise<DocumentDTO.DocumentList>;

type DocumentListFilters = Omit<
  DocumentDTO.DocumentListInput,
  'offset' | 'count'
>;

type DeleteDocument = (params: DocumentDTO.DeleteInput) => Promise<void>;

const setup = (
  getDocumentList: GetDocumentList,
  deleteDocument: DeleteDocument = async () => undefined,
) => {
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
    queries: {
      documentStatistics: cacheService.createQuerySet(() => ({
        execute: async () => documentFaker.makeStatistics(),
      })),
    },
    mutations: {
      deleteDocument: cacheService.createMutationSet(async (params) => {
        await deleteDocument(params);

        return makeFakeHttpRes(undefined);
      }),
    },
  });

  const router = createRouterMock({});
  const filtersStore = createDocumentFiltersStore(router);
  const renderDocumentStatusTagSpy = vi.fn();
  const renderDocumentActionCellSpy = vi.fn();
  const notifyServiceMock = mock<Notify>();
  const copyToClipboardSpy = vi
    .fn<CopyToClipboard>()
    .mockResolvedValue(undefined);
  const createMutationSpy = vi.spyOn(
    documentFetcherMock.mutations.deleteDocument,
    'create',
  );
  const sut = new UIStore(
    documentFetcherMock,
    filtersStore,
    renderDocumentStatusTagSpy,
    renderDocumentActionCellSpy,
    notifyServiceMock,
    copyToClipboardSpy,
    router,
  );

  return {
    sut,
    filtersStore,
    documentFetcherMock,
    renderDocumentStatusTagSpy,
    renderDocumentActionCellSpy,
    notifyServiceMock,
    copyToClipboardSpy,
    createMutationSpy,
    router,
  };
};

describe('UIStore', () => {
  it('Список запрашивается с выбранными фильтрами', async () => {
    const getDocumetListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, filtersStore } = setup(getDocumetListSpy);

    filtersStore.setSearch('  Ромашка ');
    filtersStore.setStatus(DocumentStatus.Sent);
    filtersStore.setCounterpartyId('counterparty-id');

    await when(() => Boolean(sut.list.length));

    expect(getDocumetListSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'Ромашка',
        status: DocumentStatus.Sent,
        counterpartyId: 'counterparty-id',
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

  it('Колонка действий получает строку и подготовку действий через DI', () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, renderDocumentActionCellSpy } = setup(getDocumentListSpy);
    const document = formatDocumentFromDTO(documentFaker.makeDocument());
    const column = sut.columns.find((item) => item.label === 'Действия');

    expect(column).toBeDefined();
    if (column && 'renderCell' in column) {
      column.renderCell?.(document);
    }

    expect(renderDocumentActionCellSpy).toHaveBeenCalledWith({
      row: document,
      getActions: sut.getRowActions,
    });
  });

  it('Удаление доступно только для черновика', () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut } = setup(getDocumentListSpy);
    const draft = formatDocumentFromDTO(
      documentFaker.makeDocument({ status: DocumentStatus.Draft }),
    );
    const sent = formatDocumentFromDTO(
      documentFaker.makeDocument({ status: DocumentStatus.Sent }),
    );

    expect(sut.getRowActions(draft).map(({ name }) => name)).toEqual([
      'Копировать номер',
      'Удалить',
    ]);
    expect(sut.getRowActions(sent).map(({ name }) => name)).toEqual([
      'Копировать номер',
    ]);
  });

  it('Действие удаления открывает подтверждение, а отмена не отправляет запрос', () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const deleteDocumentSpy = vi.fn<DeleteDocument>();
    const { sut } = setup(getDocumentListSpy, deleteDocumentSpy);
    const document = formatDocumentFromDTO(
      documentFaker.makeDocument({
        number: 'СЧ-00123',
        status: DocumentStatus.Draft,
      }),
    );
    const deleteAction = sut
      .getRowActions(document)
      .find(({ name }) => name === 'Удалить');

    deleteAction?.onClick?.(document);

    expect(sut.deleteDialogProps.open).toBe(true);
    expect(sut.deleteDialogProps.description).toContain('СЧ-00123');
    expect(deleteDocumentSpy).not.toHaveBeenCalled();

    sut.deleteDialogProps.onClose();

    expect(sut.deleteDialogProps.open).toBe(false);
    expect(deleteDocumentSpy).not.toHaveBeenCalled();
  });

  it('Номер документа копируется в буфер обмена', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, copyToClipboardSpy, notifyServiceMock } =
      setup(getDocumentListSpy);

    await sut.copyDocumentNumber('СЧ-00123');

    expect(copyToClipboardSpy).toHaveBeenCalledExactlyOnceWith('СЧ-00123');
    expect(notifyServiceMock.success).toHaveBeenCalledWith(
      'Номер документа скопирован',
    );
  });

  it('Ошибка копирования номера отображается пользователю', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, copyToClipboardSpy, notifyServiceMock } =
      setup(getDocumentListSpy);
    copyToClipboardSpy.mockRejectedValue(new Error('Буфер недоступен'));

    await sut.copyDocumentNumber('СЧ-00123');

    expect(notifyServiceMock.error).toHaveBeenCalledWith(
      'Не удалось скопировать номер документа',
    );
  });

  it('Успешное удаление закрывает диалог и обновляет списки и статистику', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const deleteDocumentSpy = vi
      .fn<DeleteDocument>()
      .mockResolvedValue(undefined);
    const { sut, documentFetcherMock, notifyServiceMock } = setup(
      getDocumentListSpy,
      deleteDocumentSpy,
    );
    const documentListInvalidateSpy = vi.spyOn(
      documentFetcherMock.infiniteQueries.documentList,
      'invalidate',
    );
    const statisticsInvalidateSpy = vi.spyOn(
      documentFetcherMock.queries.documentStatistics,
      'invalidate',
    );
    const document = formatDocumentFromDTO(
      documentFaker.makeDocument({ status: DocumentStatus.Draft }),
    );
    sut.requestDelete(document);

    sut.confirmDelete();

    await vi.waitFor(() =>
      expect(notifyServiceMock.success).toHaveBeenCalledWith('Документ удалён'),
    );
    expect(deleteDocumentSpy).toHaveBeenCalledExactlyOnceWith({
      id: document.id,
    });
    expect(documentListInvalidateSpy).toHaveBeenCalledExactlyOnceWith();
    expect(statisticsInvalidateSpy).toHaveBeenCalledExactlyOnceWith();
    expect(sut.deleteDialogProps.open).toBe(false);
  });

  it('Незавершённое удаление блокирует повтор, отмену и смену документа', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { promise, resolve } = Promise.withResolvers<void>();
    const deleteDocumentSpy = vi.fn<DeleteDocument>().mockReturnValue(promise);
    const { sut, notifyServiceMock } = setup(
      getDocumentListSpy,
      deleteDocumentSpy,
    );
    const firstDocument = formatDocumentFromDTO(
      documentFaker.makeDocument({
        number: 'СЧ-00001',
        status: DocumentStatus.Draft,
      }),
    );
    const secondDocument = formatDocumentFromDTO(
      documentFaker.makeDocument({
        number: 'СЧ-00002',
        status: DocumentStatus.Draft,
      }),
    );
    sut.requestDelete(firstDocument);
    sut.confirmDelete();
    await vi.waitFor(() => expect(deleteDocumentSpy).toHaveBeenCalledTimes(1));

    const pendingProps = sut.deleteDialogProps;
    sut.cancelDelete();
    sut.requestDelete(secondDocument);
    sut.confirmDelete();

    expect(pendingProps.actions.confirm.loading).toBe(true);
    expect(pendingProps.actions.confirm.disabled).toBe(true);
    expect(pendingProps.actions.cancel?.disabled).toBe(true);
    expect(sut.deleteDialogProps.description).toContain('СЧ-00001');
    expect(sut.getRowActions(firstDocument)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Удалить',
          disabled: true,
          loading: true,
        }),
      ]),
    );
    expect(deleteDocumentSpy).toHaveBeenCalledTimes(1);

    resolve();
    await vi.waitFor(() =>
      expect(notifyServiceMock.success).toHaveBeenCalledWith('Документ удалён'),
    );
    expect(sut.deleteDialogProps.open).toBe(false);
  });

  it('Ошибка удаления сохраняет диалог и позволяет повторить запрос', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const deleteDocumentSpy = vi
      .fn<DeleteDocument>()
      .mockRejectedValueOnce(new Error('Удаление запрещено'))
      .mockResolvedValueOnce(undefined);
    const { sut, documentFetcherMock, notifyServiceMock } = setup(
      getDocumentListSpy,
      deleteDocumentSpy,
    );
    const documentListInvalidateSpy = vi.spyOn(
      documentFetcherMock.infiniteQueries.documentList,
      'invalidate',
    );
    const statisticsInvalidateSpy = vi.spyOn(
      documentFetcherMock.queries.documentStatistics,
      'invalidate',
    );
    const document = formatDocumentFromDTO(
      documentFaker.makeDocument({ status: DocumentStatus.Draft }),
    );
    sut.requestDelete(document);

    sut.confirmDelete();

    await vi.waitFor(() =>
      expect(notifyServiceMock.error).toHaveBeenCalledWith(
        'Удаление запрещено',
      ),
    );
    expect(sut.deleteDialogProps.open).toBe(true);
    expect(documentListInvalidateSpy).not.toHaveBeenCalled();
    expect(statisticsInvalidateSpy).not.toHaveBeenCalled();
    expect(notifyServiceMock.success).not.toHaveBeenCalled();

    sut.confirmDelete();

    await vi.waitFor(() =>
      expect(notifyServiceMock.success).toHaveBeenCalledWith('Документ удалён'),
    );
    expect(deleteDocumentSpy).toHaveBeenCalledTimes(2);
    expect(sut.deleteDialogProps.open).toBe(false);
  });

  it('Мутация удаления создаётся один раз', () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, createMutationSpy } = setup(getDocumentListSpy);
    const document = formatDocumentFromDTO(
      documentFaker.makeDocument({ status: DocumentStatus.Draft }),
    );

    sut.getRowActions(document);
    sut.requestDelete(document);
    void sut.deleteDialogProps;
    sut.cancelDelete();

    expect(createMutationSpy).toHaveBeenCalledTimes(1);
  });

  it('Список запрашивается с сортировкой', async () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut } = setup(getDocumentListSpy);

    sut.sort({ fieldId: 'sum', sort: 'asc' });

    await when(() => Boolean(sut.list.length));

    expect(getDocumentListSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sortField: 'sum',
        sortOrder: 'asc',
      }),
    );
    expect(sut.sorting).toEqual({ fieldId: 'sum', sort: 'asc' });
  });

  it('Сортировка восстанавливается из search params', () => {
    const getDocumentListSpy = vi
      .fn<GetDocumentList>()
      .mockResolvedValue(documentFaker.makeDocumentList({ length: 1 }));
    const { sut, router } = setup(getDocumentListSpy);

    router.setSearchParams({ sortField: 'createdAt', sortOrder: 'desc' });

    expect(sut.sorting).toEqual({
      fieldId: 'createdAt',
      sort: 'desc',
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
