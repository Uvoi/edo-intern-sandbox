import { makeAutoObservable } from 'mobx';

import { type DocumentDTO, type DocumentStatus } from '#api/dto/document';

export class DocumentFiltersStore {
  public search = '';

  public status?: DocumentStatus;

  public counterpartyId?: string;

  public constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get filters(): DocumentDTO.FilterInput {
    const search = this.search.trim();

    return {
      search: search || undefined,
      status: this.status,
      counterpartyId: this.counterpartyId,
    };
  }

  public setSearch = (search: string) => {
    this.search = search;
  };

  public setStatus = (status?: DocumentStatus) => {
    this.status = status;
  };

  public setCounterpartyId = (counterpartyId?: string) => {
    this.counterpartyId = counterpartyId;
  };

  public reset = () => {
    this.search = '';
    this.status = undefined;
    this.counterpartyId = undefined;
  };
}

export const documentFiltersStore = new DocumentFiltersStore();
