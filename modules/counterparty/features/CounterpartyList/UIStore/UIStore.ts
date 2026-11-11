import { makeAutoObservable } from 'mobx';

import { type CounterpartyDTO } from '#api/dto/counterparty';
import {
  type CounterpartyFetcher,
  counterpartyFetcher,
} from '#api/fetchers/counterparty';
import { type ConfirmDialogProps } from '#shared/components/ConfirmDialog';
import { type DataGridColumns } from '#shared/components/DataGrid';
import { type Notify, notify } from '#shared/services/Notification';
import {
  adaptComponentToDomain,
  type RenderComponentInDomain,
} from '#shared/utils/adaptComponentToDomain';

import {
  CounterpartyActionCell,
  type CounterpartyActionCellProps,
} from '../components/CounterpartyActionCell';

export class UIStore {
  public search = '';

  private selectedCounterparty?: CounterpartyDTO.Counterparty;

  private readonly archiveStateMutation;

  public constructor(
    private readonly _counterpartyFetcher: CounterpartyFetcher,
    private readonly _notifyService: Notify,
    private readonly _renderActionCell: RenderComponentInDomain<CounterpartyActionCellProps>,
  ) {
    this.archiveStateMutation =
      this._counterpartyFetcher.mutations.changeArchiveState.create();
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get list() {
    return this.counterpartyListQuery.data?.data ?? [];
  }

  public get status() {
    const { isLoading, isError, error } = this.counterpartyListQuery;

    return { isLoading, isError, errorMsg: error?.message };
  }

  public get columns(): DataGridColumns<CounterpartyDTO.Counterparty>[] {
    return [
      { field: 'name', label: 'Наименование' },
      { field: 'inn', label: 'ИНН', width: '180px' },
      { field: 'kpp', label: 'КПП', width: '180px' },
      {
        field: 'isArchived',
        label: 'Состояние',
        width: '140px',
        format: ({ isArchived }) => (isArchived ? 'В архиве' : 'Активен'),
      },
      {
        label: 'Действия',
        width: '100px',
        renderCell: (row) =>
          this._renderActionCell({ row, getActions: this.getRowActions }),
      },
    ];
  }

  public get archiveDialogProps(): ConfirmDialogProps {
    return {
      open: Boolean(this.selectedCounterparty),
      title: this.selectedCounterparty?.isArchived
        ? 'Восстановить контрагента?'
        : 'Переместить контрагента в архив?',
      description: this.selectedCounterparty?.name,
      onClose: this.cancelArchiveChange,
      disableBackdropClick: this.archiveStateMutation.isLoading,
      actions: {
        confirm: {
          text: this.selectedCounterparty?.isArchived
            ? 'Восстановить'
            : 'В архив',
          onClick: this.confirmArchiveChange,
          loading: this.archiveStateMutation.isLoading,
          disabled: this.archiveStateMutation.isLoading,
        },
        cancel: {
          text: 'Отмена',
          disabled: this.archiveStateMutation.isLoading,
        },
      },
    };
  }

  public getRowActions = (row: CounterpartyDTO.Counterparty) => [
    {
      name: row.isArchived ? 'Восстановить' : 'В архив',
      onClick: () => this.requestArchiveChange(row),
      disabled: this.archiveStateMutation.isLoading,
      loading:
        this.archiveStateMutation.isLoading &&
        this.selectedCounterparty?.id === row.id,
      isBlockingOperation: true,
      loadingNote: 'Состояние контрагента изменяется',
    },
  ];

  public requestArchiveChange = (row: CounterpartyDTO.Counterparty) => {
    if (this.archiveStateMutation.isLoading) {
      return;
    }
    this.selectedCounterparty = { ...row };
  };

  public cancelArchiveChange = () => {
    if (this.archiveStateMutation.isLoading) {
      return;
    }
    this.selectedCounterparty = undefined;
  };

  public confirmArchiveChange = () => {
    const selectedCounterparty = this.selectedCounterparty;
    if (!selectedCounterparty || this.archiveStateMutation.isLoading) {
      return;
    }

    const { id, isArchived } = selectedCounterparty;
    this.archiveStateMutation.sync({
      params: { id, isArchived: !isArchived },
      onSuccess: () => {
        this.selectedCounterparty = undefined;
        this._counterpartyFetcher.queries.counterpartyList.invalidate();
        this._notifyService.success(
          isArchived
            ? 'Контрагент восстановлен'
            : 'Контрагент перемещён в архив',
        );
      },
      onError: (error) => {
        this._notifyService.error(
          error instanceof Error
            ? error.message
            : 'Не удалось изменить состояние контрагента',
        );
      },
    });
  };

  public setSearch = (value: string) => {
    this.search = value;
  };

  public retry = () => {
    this.counterpartyListQuery.invalidate();
  };

  private get counterpartyListQuery() {
    const search = this.search.trim();

    return this._counterpartyFetcher.queries.counterpartyList.create({
      search: search || undefined,
    });
  }
}

export const createUIStore = () =>
  new UIStore(
    counterpartyFetcher,
    notify,
    adaptComponentToDomain(CounterpartyActionCell),
  );
