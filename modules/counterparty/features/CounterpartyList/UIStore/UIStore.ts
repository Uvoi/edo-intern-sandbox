import { makeAutoObservable } from 'mobx';

import { type CounterpartyDTO } from '#api/dto/counterparty';
import {
  type CounterpartyFetcher,
  counterpartyFetcher,
} from '#api/fetchers/counterparty';
import { type DataGridColumns } from '#shared/components/DataGrid';

export class UIStore {
  public search = '';

  public constructor(
    private readonly _counterpartyFetcher: CounterpartyFetcher,
  ) {
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
    ];
  }

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

export const createUIStore = () => new UIStore(counterpartyFetcher);
