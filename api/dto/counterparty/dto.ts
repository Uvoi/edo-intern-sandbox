import { type ListsDTO } from '../common/lists';

export namespace CounterpartyDTO {
  export type Counterparty = {
    id: string;
    name: string;
    inn: string;
    kpp?: string;
    /** Необязательное поле для совместимости с вложенными DTO документов. */
    isArchived?: boolean;
  };

  export type CounterpartyListInput = {
    /**
     * Поиск по наименованию или ИНН
     */
    search?: string;
  };

  export type ChangeArchiveStateInput = Pick<Counterparty, 'id'> & {
    isArchived: boolean;
  };

  export type CounterpartyList = ListsDTO.WithPagination<Counterparty>;
}
