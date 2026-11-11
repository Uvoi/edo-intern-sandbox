import { when } from 'mobx';
import { describe, expect, it, vi } from 'vitest';

import { type CounterpartyDTO } from '#api/dto/counterparty';
import { counterpartyFaker } from '#api/fakers/counterparty';
import { type CounterpartyFetcher } from '#api/fetchers/counterparty';
import { createCacheService } from '#api/services/CacheService';
import { ApiHTTPError } from '#api/services/MainApiHttpClient';
import { type Notify } from '#shared/services/Notification';
import { mock } from '#shared/tests/mock';
import { mockFetcher } from '#shared/tests/mockFetcher';

import { UIStore } from './UIStore';

type GetCounterpartyList = (
  params?: CounterpartyDTO.CounterpartyListInput,
) => Promise<CounterpartyDTO.CounterpartyList>;

type ChangeArchiveState = (
  params: CounterpartyDTO.ChangeArchiveStateInput,
) => Promise<CounterpartyDTO.Counterparty>;

const setup = (
  getCounterpartyList: GetCounterpartyList = async () =>
    counterpartyFaker.makeCounterpartyList({ length: 1 }),
  changeArchiveState: ChangeArchiveState = async (params) =>
    counterpartyFaker.makeCounterparty(params),
) => {
  const cacheService = createCacheService();
  const notifyServiceMock = mock<Notify>();
  const renderActionCellSpy = vi.fn();
  const counterpartyFetcherMock = mockFetcher<CounterpartyFetcher>({
    queries: {
      counterpartyList: cacheService.createQuerySet(
        (params?: CounterpartyDTO.CounterpartyListInput) => ({
          execute: () => getCounterpartyList(params),
        }),
      ),
    },
    mutations: {
      changeArchiveState: cacheService.createMutationSet(changeArchiveState),
    },
  });

  const createMutationSpy = vi.spyOn(
    counterpartyFetcherMock.mutations.changeArchiveState,
    'create',
  );
  const sut = new UIStore(
    counterpartyFetcherMock,
    notifyServiceMock,
    renderActionCellSpy,
  );

  return {
    sut,
    counterpartyFetcherMock,
    notifyServiceMock,
    renderActionCellSpy,
    createMutationSpy,
  };
};

describe('UIStore', () => {
  it('Список запрашивается с search из поля поиска без пробелов по краям', async () => {
    const getCounterpartyListSpy = vi
      .fn<GetCounterpartyList>()
      .mockResolvedValue(counterpartyFaker.makeCounterpartyList({ length: 1 }));
    const { sut } = setup(getCounterpartyListSpy);

    sut.setSearch('  Ромашка ');
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

  it('Успешная архивация обновляет набор списков, закрывает диалог и сохраняет поиск', async () => {
    const changeArchiveStateSpy = vi
      .fn<ChangeArchiveState>()
      .mockResolvedValue(
        counterpartyFaker.makeCounterparty({ isArchived: true }),
      );
    const { sut, counterpartyFetcherMock, notifyServiceMock } = setup(
      undefined,
      changeArchiveStateSpy,
    );
    const invalidateSpy = vi.spyOn(
      counterpartyFetcherMock.queries.counterpartyList,
      'invalidate',
    );
    const row = counterpartyFaker.makeCounterparty({ isArchived: false });
    sut.setSearch('Ромашка');
    sut.requestArchiveChange(row);

    sut.confirmArchiveChange();

    await vi.waitFor(() =>
      expect(notifyServiceMock.success).toHaveBeenCalledWith(
        'Контрагент перемещён в архив',
      ),
    );
    expect(changeArchiveStateSpy).toHaveBeenCalledExactlyOnceWith({
      id: row.id,
      isArchived: true,
    });
    expect(invalidateSpy).toHaveBeenCalledExactlyOnceWith();
    expect(sut.archiveDialogProps.open).toBe(false);
    expect(sut.search).toBe('Ромашка');
  });

  it('Незавершённая мутация блокирует повтор, отмену и переключение контрагента', async () => {
    const { promise, resolve } =
      Promise.withResolvers<CounterpartyDTO.Counterparty>();
    const changeArchiveStateSpy = vi
      .fn<ChangeArchiveState>()
      .mockReturnValue(promise);
    const { sut, notifyServiceMock } = setup(undefined, changeArchiveStateSpy);
    const row = counterpartyFaker.makeCounterparty({ name: 'Первый' });
    sut.requestArchiveChange(row);
    sut.confirmArchiveChange();
    await vi.waitFor(() =>
      expect(changeArchiveStateSpy).toHaveBeenCalledTimes(1),
    );

    const pendingProps = sut.archiveDialogProps;
    sut.cancelArchiveChange();
    sut.requestArchiveChange(
      counterpartyFaker.makeCounterparty({ name: 'Другой' }),
    );
    sut.confirmArchiveChange();

    expect(pendingProps.actions.confirm.loading).toBe(true);
    expect(pendingProps.actions.confirm.disabled).toBe(true);
    expect(pendingProps.actions.cancel?.disabled).toBe(true);
    expect(sut.archiveDialogProps.open).toBe(true);
    expect(sut.archiveDialogProps.description).toContain('Первый');
    expect(sut.getRowActions(row)[0].disabled).toBe(true);
    expect(changeArchiveStateSpy).toHaveBeenCalledTimes(1);
    expect(notifyServiceMock.success).not.toHaveBeenCalled();

    resolve(
      counterpartyFaker.makeCounterparty({ id: row.id, isArchived: true }),
    );
    await vi.waitFor(() =>
      expect(notifyServiceMock.success).toHaveBeenCalledTimes(1),
    );
    expect(sut.archiveDialogProps.open).toBe(false);
    expect(sut.getRowActions(row)[0].disabled).toBe(false);
  });

  it('Ошибка сохраняет подтверждение и допускает повтор без ложного успеха', async () => {
    const changeArchiveStateSpy = vi
      .fn<ChangeArchiveState>()
      .mockRejectedValueOnce(
        new ApiHTTPError({
          errors: [{ message: 'Учебный отказ', additionalInfo: {} }],
          config: undefined,
        }),
      )
      .mockResolvedValue(
        counterpartyFaker.makeCounterparty({ isArchived: true }),
      );
    const { sut, counterpartyFetcherMock, notifyServiceMock } = setup(
      undefined,
      changeArchiveStateSpy,
    );
    const invalidateSpy = vi.spyOn(
      counterpartyFetcherMock.queries.counterpartyList,
      'invalidate',
    );
    const row = counterpartyFaker.makeCounterparty({ name: 'Повтор' });
    sut.requestArchiveChange(row);

    sut.confirmArchiveChange();

    await vi.waitFor(() =>
      expect(notifyServiceMock.error).toHaveBeenCalledWith('Учебный отказ'),
    );
    expect(sut.archiveDialogProps.open).toBe(true);
    expect(sut.archiveDialogProps.description).toContain('Повтор');
    expect(sut.archiveDialogProps.actions.confirm.disabled).toBe(false);
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(notifyServiceMock.success).not.toHaveBeenCalled();

    sut.confirmArchiveChange();

    await vi.waitFor(() =>
      expect(notifyServiceMock.success).toHaveBeenCalledTimes(1),
    );
    expect(changeArchiveStateSpy).toHaveBeenCalledTimes(2);
    expect(sut.archiveDialogProps.open).toBe(false);
  });

  it('Архивный контрагент восстанавливается с явным подтверждением', async () => {
    const changeArchiveStateSpy = vi
      .fn<ChangeArchiveState>()
      .mockResolvedValue(
        counterpartyFaker.makeCounterparty({ isArchived: false }),
      );
    const { sut, notifyServiceMock } = setup(undefined, changeArchiveStateSpy);
    const row = counterpartyFaker.makeCounterparty({ isArchived: true });

    sut.getRowActions(row)[0].onClick();

    expect(sut.archiveDialogProps.title).toBe('Восстановить контрагента?');
    expect(sut.archiveDialogProps.actions.confirm.text).toBe('Восстановить');
    sut.confirmArchiveChange();
    await vi.waitFor(() =>
      expect(notifyServiceMock.success).toHaveBeenCalledWith(
        'Контрагент восстановлен',
      ),
    );
    expect(changeArchiveStateSpy).toHaveBeenCalledExactlyOnceWith({
      id: row.id,
      isArchived: false,
    });
  });

  it('Колонка действий получает строку и подготовку пунктов через DI', () => {
    const { sut, renderActionCellSpy } = setup();
    const row = counterpartyFaker.makeCounterparty();
    const column = sut.columns.find((item) => item.label === 'Действия');

    expect(column).toBeDefined();
    if (column && 'renderCell' in column) {
      column.renderCell?.(row);
    }

    expect(renderActionCellSpy).toHaveBeenCalledWith({
      row,
      getActions: sut.getRowActions,
    });
  });

  it('Мутация создаётся один раз независимо от обращений к props', () => {
    const { sut, createMutationSpy } = setup();
    const row = counterpartyFaker.makeCounterparty();
    sut.requestArchiveChange(row);
    expect(sut.archiveDialogProps.actions.confirm.loading).toBe(false);
    sut.getRowActions(row);
    sut.cancelArchiveChange();
    expect(sut.archiveDialogProps.open).toBe(false);

    expect(createMutationSpy).toHaveBeenCalledTimes(1);
  });

  it('Подтверждение без выбранного контрагента не отправляет запрос', () => {
    const changeArchiveStateSpy = vi.fn<ChangeArchiveState>();
    const { sut, notifyServiceMock } = setup(undefined, changeArchiveStateSpy);

    sut.confirmArchiveChange();

    expect(changeArchiveStateSpy).not.toHaveBeenCalled();
    expect(notifyServiceMock.success).not.toHaveBeenCalled();
  });

  it('Действие открывает подтверждение с выбранным контрагентом без запроса', () => {
    const changeArchiveStateSpy = vi.fn<ChangeArchiveState>();
    const { sut } = setup(undefined, changeArchiveStateSpy);
    const row = counterpartyFaker.makeCounterparty({ name: 'ООО Пример' });

    sut.getRowActions(row)[0].onClick();

    expect(sut.archiveDialogProps.open).toBe(true);
    expect(sut.archiveDialogProps.description).toContain('ООО Пример');
    expect(sut.archiveDialogProps.actions.confirm.text).toBe('В архив');
    expect(changeArchiveStateSpy).not.toHaveBeenCalled();

    sut.archiveDialogProps.onClose();

    expect(sut.archiveDialogProps.open).toBe(false);
    expect(changeArchiveStateSpy).not.toHaveBeenCalled();
  });
});
