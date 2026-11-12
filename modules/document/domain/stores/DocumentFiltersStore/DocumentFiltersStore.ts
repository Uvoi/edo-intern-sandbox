import { makeAutoObservable } from 'mobx';

import { type DocumentDTO, DocumentStatus } from '#api/dto/document';
import {
  type Router,
  router,
  type SearchParamsStore,
} from '#shared/services/Router';
import { v } from '#shared/services/v';

const DOCUMENT_STATUS_PATTERN = new RegExp(
  `^(?:${Object.values(DocumentStatus).join('|')})$`,
);

const createSearchParamsStore = (routerService: Router) =>
  routerService.createSearchParamsStore<DocumentDTO.FilterInput>({
    validationSchema: {
      search: v.optional(v.string()),
      status: v.optional(v.string(v.pattern(DOCUMENT_STATUS_PATTERN))),
      counterpartyId: v.optional(v.string()),
    },
  });

export class DocumentFiltersStore {
  public constructor(
    private readonly _searchParamsStore: SearchParamsStore<DocumentDTO.FilterInput>,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get search() {
    return this._searchParamsStore.values?.search ?? '';
  }

  public get status() {
    return this._searchParamsStore.values?.status;
  }

  public get counterpartyId() {
    return this._searchParamsStore.values?.counterpartyId;
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
    if (!search) {
      this._searchParamsStore.delete('search');
      return;
    }

    this._searchParamsStore.set('search', search);
  };

  public setStatus = (status?: DocumentStatus) => {
    if (!status) {
      this._searchParamsStore.delete('status');
      return;
    }

    this._searchParamsStore.set('status', status);
  };

  public setCounterpartyId = (counterpartyId?: string) => {
    if (!counterpartyId) {
      this._searchParamsStore.delete('counterpartyId');
      return;
    }

    this._searchParamsStore.set('counterpartyId', counterpartyId);
  };

  public reset = () => {
    this._searchParamsStore.reset();
  };
}

export const createDocumentFiltersStore = (routerService: Router = router) =>
  new DocumentFiltersStore(createSearchParamsStore(routerService));

export const documentFiltersStore = createDocumentFiltersStore();
