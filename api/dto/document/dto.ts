import { type ListsDTO } from '../common/lists';
import { type CounterpartyDTO } from '../counterparty';
import { type DocumentStatus, type DocumentType } from './enums';

export namespace DocumentDTO {
  export type Document = {
    id: string;
    /**
     * Номер документа, например «СЧ-00123»
     */
    number: string;
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    counterparty: CounterpartyDTO.Counterparty;
    /**
     * Сумма документа в копейках
     */
    sum: number;
    /**
     * ISO-строка
     */
    createdAt: string;
  };

  export type DocumentListSorting = keyof Pick<
    Document,
    'name' | 'sum' | 'createdAt'
  >;

  export type FilterInput = {
    /**
     * Поиск по наименованию или номеру документа
     */
    search?: string;
    status?: DocumentStatus;
    counterpartyId?: string;
  };

  export type DocumentListInput = ListsDTO.PaginationInput &
    ListsDTO.SortInput<DocumentListSorting> &
    FilterInput;

  export type DocumentList = ListsDTO.WithPagination<Document>;

  export type StatisticsInput = Omit<FilterInput, 'status'>;

  export type StatisticsItem = {
    status: DocumentStatus;
    count: number;
  };

  export type Statistics = StatisticsItem[];

  export type CreateInput = {
    name: string;
    type: DocumentType;
    counterpartyId: string;
    /**
     * Сумма документа в копейках
     */
    sum: number;
  };

  export type DeleteInput = Pick<Document, 'id'>;
}
