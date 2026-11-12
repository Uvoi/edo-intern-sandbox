import { makeAutoObservable } from 'mobx';

import { type ListsDTO } from '#api/dto/common/lists';
import { type DocumentDTO } from '#api/dto/document';
import { type DocumentFetcher, documentFetcher } from '#api/fetchers/document';
import {
  type DocumentFiltersStore,
  documentFiltersStore,
} from '#modules/document/domain/stores/DocumentFiltersStore';
import {
  type DataGridColumns,
  type DataGridSort,
} from '#shared/components/DataGrid';
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

  public constructor(
    private readonly _documentFetcher: DocumentFetcher,
    private readonly _filtersStore: DocumentFiltersStore,
    private readonly _renderDocumentStatusTag: RenderComponentInDomain<DocumentStatusTagProps>,
    routerService: Router,
  ) {
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
    router,
  );
