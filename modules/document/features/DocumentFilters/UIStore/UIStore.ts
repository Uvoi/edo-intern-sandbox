import { makeAutoObservable } from 'mobx';

import { DocumentStatus } from '#api/dto/document';
import {
  type CounterpartyFetcher,
  counterpartyFetcher,
} from '#api/fetchers/counterparty';
import { DOCUMENT_STATUS_LABELS } from '#modules/document/domain/constants';
import {
  type DocumentFiltersStore,
  documentFiltersStore,
} from '#modules/document/domain/stores/DocumentFiltersStore';

export class UIStore {
  public constructor(
    private readonly _filtersStore: DocumentFiltersStore,
    private readonly _counterpartyFetcher: CounterpartyFetcher,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get search() {
    return this._filtersStore.search;
  }

  public get status() {
    return this._filtersStore.status;
  }

  public get counterpartyId() {
    return this._filtersStore.counterpartyId;
  }

  public get statusOptions() {
    return Object.values(DocumentStatus).map((value) => ({
      value,
      label: DOCUMENT_STATUS_LABELS[value],
    }));
  }

  public get counterpartyList() {
    return this.counterpartyListQuery.data?.data ?? [];
  }

  public get counterpartyOptions() {
    return this.counterpartyList.map(({ id, name, inn }) => ({
      value: id,
      label: `${name} (${inn})`,
    }));
  }

  public get counterpartyListStatus() {
    const { isLoading, isError, error } = this.counterpartyListQuery;

    return {
      isLoading,
      isError,
      errorMsg: error?.message,
    };
  }

  public setSearch = (search: string) => {
    this._filtersStore.setSearch(search);
  };

  public setStatus = (status?: DocumentStatus) => {
    this._filtersStore.setStatus(status);
  };

  public setCounterpartyId = (id?: string) => {
    this._filtersStore.setCounterpartyId(id);
  };

  public getCounterpartyLabel = (value: string | number) => {
    return (
      this.counterpartyOptions.find((option) => option.value === value)
        ?.label ?? String(value)
    );
  };

  public reset = () => {
    this._filtersStore.reset();
  };

  private get counterpartyListQuery() {
    return this._counterpartyFetcher.queries.counterpartyList.create();
  }
}

export const createUIStore = () =>
  new UIStore(documentFiltersStore, counterpartyFetcher);
