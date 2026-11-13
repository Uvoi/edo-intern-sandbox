import { makeAutoObservable } from 'mobx';

import { type ListsDTO } from '#api/dto/common/lists';
import { type DocumentDTO } from '#api/dto/document';
import { type DocumentFetcher, documentFetcher } from '#api/fetchers/document';
import { canDeleteDocument } from '#modules/document/domain/rules/canDeleteDocument';
import {
  type DocumentFiltersStore,
  documentFiltersStore,
} from '#modules/document/domain/stores/DocumentFiltersStore';
import { type ConfirmDialogProps } from '#shared/components/ConfirmDialog';
import {
  type DataGridColumns,
  type DataGridSort,
} from '#shared/components/DataGrid';
import {
  type CopyToClipboard,
  copyToClipboard,
} from '#shared/services/Clipboard';
import { type Notify, notify } from '#shared/services/Notification';
import {
  type Router,
  router,
  type SearchParamsStore,
} from '#shared/services/Router';
import { v } from '#shared/services/v';
import {
  adaptComponentToDomain,
  type RenderComponentInDomain,
} from '#shared/utils/adaptComponentToDomain';

import {
  DocumentActionCell,
  type DocumentActionCellProps,
} from '../components/DocumentActionCell';
import {
  DocumentStatusTag,
  type DocumentStatusTagProps,
} from '../components/DocumentStatusTag';
import {
  type FormattedDocument,
  formatDocumentFromDTO,
} from '../utils/formatDocumentFromDTO';

type DocumentSortingSearchParams = {
  sortField?: DocumentDTO.DocumentListSorting;
  sortOrder?: ListsDTO.SortingOrder;
};

const SORT_FIELD_PATTERN = /^(?:name|sum|createdAt)$/;

const SORT_ORDER_PATTERN = /^(?:asc|desc)$/;

export class UIStore {
  private readonly _sortingSearchParamsStore: SearchParamsStore<DocumentSortingSearchParams>;

  private selectedDocument?: FormattedDocument;

  private readonly deleteDocumentMutation;

  public constructor(
    private readonly _documentFetcher: DocumentFetcher,
    private readonly _filtersStore: DocumentFiltersStore,
    private readonly _renderDocumentStatusTag: RenderComponentInDomain<DocumentStatusTagProps>,
    private readonly _renderDocumentActionCell: RenderComponentInDomain<DocumentActionCellProps>,
    private readonly _notifyService: Notify,
    private readonly _copyToClipboard: CopyToClipboard,
    routerService: Router,
  ) {
    this.deleteDocumentMutation =
      this._documentFetcher.mutations.deleteDocument.create();
    this._sortingSearchParamsStore =
      routerService.createSearchParamsStore<DocumentSortingSearchParams>({
        validationSchema: {
          sortField: v.optional(v.string(v.pattern(SORT_FIELD_PATTERN))),
          sortOrder: v.optional(v.string(v.pattern(SORT_ORDER_PATTERN))),
        },
      });

    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get list() {
    return (this.documentListQuery.data ?? []).map(formatDocumentFromDTO);
  }

  public get isEndReached() {
    return this.documentListQuery.isEndReached;
  }

  public get sorting():
    | DataGridSort<DocumentDTO.DocumentListSorting>
    | undefined {
    const { sortField, sortOrder } =
      this._sortingSearchParamsStore.values ?? {};

    if (!sortField || !sortOrder) {
      return undefined;
    }

    return { fieldId: sortField, sort: sortOrder };
  }

  public get status() {
    const query = this.documentListQuery;
    const fetchMoreStatus = query.fetchMoreStatus;

    return {
      isLoading: query.isLoading || fetchMoreStatus.isLoading,
      isError: query.isError || fetchMoreStatus.isError,
      errorMsg: query.error?.message ?? fetchMoreStatus.error?.message,
    };
  }

  public get deleteDialogProps(): ConfirmDialogProps {
    return {
      open: Boolean(this.selectedDocument),
      title: 'Удалить документ?',
      description: this.selectedDocument
        ? `Документ ${this.selectedDocument.number} будет удалён без возможности восстановления`
        : undefined,
      onClose: this.cancelDelete,
      disableBackdropClick: this.deleteDocumentMutation.isLoading,
      actions: {
        confirm: {
          text: 'Удалить',
          onClick: this.confirmDelete,
          loading: this.deleteDocumentMutation.isLoading,
          disabled: this.deleteDocumentMutation.isLoading,
        },
        cancel: {
          text: 'Отмена',
          disabled: this.deleteDocumentMutation.isLoading,
        },
      },
    };
  }

  public loadMore = () => {
    const query = this.documentListQuery;

    if (query.isEndReached || query.fetchMoreStatus.isLoading) {
      return;
    }

    query.fetchMore();
  };

  public retry = () => {
    const query = this.documentListQuery;

    if (query.fetchMoreStatus.isError) {
      query.fetchMore();
      return;
    }

    query.invalidate();
  };

  public sort = (sorting?: DataGridSort<DocumentDTO.DocumentListSorting>) => {
    if (!sorting) {
      this._sortingSearchParamsStore.reset();
      return;
    }

    this._sortingSearchParamsStore.setAll({
      sortField: sorting.fieldId,
      sortOrder: sorting.sort,
    });
  };

  public getRowActions = (document: FormattedDocument) => {
    const actions: ReturnType<DocumentActionCellProps['getActions']> = [
      {
        name: 'Копировать номер',
        onClick: () => this.copyDocumentNumber(document.number),
        disabled: this.deleteDocumentMutation.isLoading,
      },
    ];

    if (canDeleteDocument(document)) {
      actions.push({
        name: 'Удалить',
        onClick: () => this.requestDelete(document),
        disabled: this.deleteDocumentMutation.isLoading,
        loading:
          this.deleteDocumentMutation.isLoading &&
          this.selectedDocument?.id === document.id,
        isBlockingOperation: true,
        loadingNote: 'Документ удаляется',
      });
    }

    return actions;
  };

  public copyDocumentNumber = async (number: string) => {
    try {
      await this._copyToClipboard(number);
      this._notifyService.success('Номер документа скопирован');
    } catch {
      this._notifyService.error('Не удалось скопировать номер документа');
    }
  };

  public requestDelete = (document: FormattedDocument) => {
    if (this.deleteDocumentMutation.isLoading || !canDeleteDocument(document)) {
      return;
    }

    this.selectedDocument = { ...document };
  };

  public cancelDelete = () => {
    if (this.deleteDocumentMutation.isLoading) {
      return;
    }

    this.selectedDocument = undefined;
  };

  public confirmDelete = () => {
    const selectedDocument = this.selectedDocument;

    if (
      !selectedDocument ||
      this.deleteDocumentMutation.isLoading ||
      !canDeleteDocument(selectedDocument)
    ) {
      return;
    }

    this.deleteDocumentMutation.sync({
      params: { id: selectedDocument.id },
      onSuccess: () => {
        this.selectedDocument = undefined;
        this._documentFetcher.infiniteQueries.documentList.invalidate();
        this._documentFetcher.queries.documentStatistics.invalidate();
        this._notifyService.success('Документ удалён');
      },
      onError: (error) => {
        this._notifyService.error(
          error instanceof Error
            ? error.message
            : 'Не удалось удалить документ',
        );
      },
    });
  };

  public get columns(): DataGridColumns<FormattedDocument>[] {
    return [
      { field: 'number', label: 'Номер' },
      { field: 'name', label: 'Наименование', sortable: true },
      { field: 'counterparty', label: 'Контрагент' },
      { field: 'sum', label: 'Сумма', sortable: true },
      {
        field: 'status',
        label: 'Статус',
        renderCell: (document) =>
          this._renderDocumentStatusTag({
            color: document.statusColor,
            label: document.statusLabel,
          }),
      },
      { field: 'createdAt', label: 'Дата создания', sortable: true },
      {
        label: 'Действия',
        width: '100px',
        renderCell: (document) =>
          this._renderDocumentActionCell({
            row: document,
            getActions: this.getRowActions,
          }),
      },
    ];
  }

  private get documentListQuery() {
    return this._documentFetcher.infiniteQueries.documentList.create({
      ...this._filtersStore.filters,
      ...this._sortingSearchParamsStore.values,
    });
  }
}

export const createUIStore = () =>
  new UIStore(
    documentFetcher,
    documentFiltersStore,
    adaptComponentToDomain(DocumentStatusTag),
    adaptComponentToDomain(DocumentActionCell),
    notify,
    copyToClipboard,
    router,
  );
