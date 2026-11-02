import { type ListsDTO } from '../common/lists';

export namespace CounterpartyDTO {
  export type Counterparty = {
    id: string;
    name: string;
    inn: string;
    kpp?: string;
  };

  export type CounterpartyListInput = {
    /**
     * Поиск по наименованию или ИНН
     */
    search?: string;
  };

  export type CounterpartyList = ListsDTO.WithPagination<Counterparty>;
}
