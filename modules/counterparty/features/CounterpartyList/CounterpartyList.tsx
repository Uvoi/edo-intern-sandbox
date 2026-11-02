import { observer } from 'mobx-react-lite';
import { type ChangeEvent } from 'react';

import { DataGrid } from '#shared/components/DataGrid';
import { SearchField } from '#shared/components/SearchField';
import { useStore } from '#shared/hooks/useStore';

import { Wrapper } from './styles';
import { createUIStore } from './UIStore';

export const CounterpartyList = observer(() => {
  const { search, setSearch, list, columns, status, retry } =
    useStore(createUIStore);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <Wrapper>
      <SearchField
        value={search}
        placeholder="Наименование или ИНН"
        onChange={handleSearchChange}
      />
      <DataGrid
        keyId="id"
        rows={list}
        columns={columns}
        onRetry={retry}
        {...status}
      />
    </Wrapper>
  );
});
