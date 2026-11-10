import { makeAutoObservable } from 'mobx';

import { type DocumentFetcher, documentFetcher } from '#api/fetchers/document';
import { type DataGridColumns } from '#shared/components/DataGrid';
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

export class UIStore {
  public search = '';

  public constructor(
    private readonly _documentFetcher: DocumentFetcher,
    private readonly _renderDocumentStatusTag: RenderComponentInDomain<DocumentStatusTagProps>,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get list() {
    return (this.documentListQuery.data ?? []).map(formatDocumentFromDTO);
  }

  public get isEndReached() {
    return this.documentListQuery.isEndReached;
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

  public get columns(): DataGridColumns<FormattedDocument>[] {
    return [
      { field: 'number', label: 'Номер' },
      { field: 'name', label: 'Наименование' },
      { field: 'counterparty', label: 'Контрагент' },
      { field: 'sum', label: 'Сумма' },
      {
        field: 'status',
        label: 'Статус',
        renderCell: (document) =>
          this._renderDocumentStatusTag({
            color: document.statusColor,
            label: document.statusLabel,
          }),
      },
      { field: 'createdAt', label: 'Дата создания' },
    ];
  }

  public setSearch = (value: string) => {
    this.search = value;
  };

  private get documentListQuery() {
    const search = this.search.trim();

    return this._documentFetcher.infiniteQueries.documentList.create({
      search: search || undefined,
    });
  }
}

export const createUIStore = () =>
  new UIStore(documentFetcher, adaptComponentToDomain(DocumentStatusTag));
