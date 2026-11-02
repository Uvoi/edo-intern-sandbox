export namespace ListsDTO {
  export type SortingOrder = 'asc' | 'desc';

  export type PaginationInput = {
    offset: number;
    count: number;
  };

  export type SortInput<TSortField extends string = string> = {
    sortField?: TSortField;
    sortOrder?: SortingOrder;
  };

  export type PaginationMeta = {
    totalCount: number;
  };

  export type WithPagination<TData extends object> = {
    data: TData[];
    meta: PaginationMeta;
  };
}
