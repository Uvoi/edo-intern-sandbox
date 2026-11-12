import { observer } from 'mobx-react-lite';
import { type ChangeEvent } from 'react';

import { type DocumentStatus } from '#api/dto/document';
import { Button } from '#shared/components/Button';
import { MenuItem } from '#shared/components/MenuItem';
import { SearchField } from '#shared/components/SearchField';
import { Select } from '#shared/components/Select';
import { useStore } from '#shared/hooks/useStore';

import { Wrapper } from './styles';
import { createUIStore } from './UIStore';

export const DocumentFilters = observer(() => {
  const {
    search,
    status,
    statusOptions,
    counterpartyId,
    counterpartyOptions,
    counterpartyListStatus,
    setSearch,
    setStatus,
    setCounterpartyId,
    getCounterpartyLabel,
    reset,
  } = useStore(createUIStore);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <Wrapper>
      <SearchField
        value={search}
        placeholder="Поиск по документам"
        onChange={handleSearchChange}
      />
      <Select<DocumentStatus | ''>
        value={status ?? ''}
        label="Статус"
        placeholder="Все статусы"
        onChange={(event) => {
          const value = event.target.value as DocumentStatus | '';
          setStatus(value || undefined);
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <Select<string | ''>
        value={counterpartyId ?? ''}
        label="Контрагент"
        placeholder="Все контрагенты"
        getOptionLabel={getCounterpartyLabel}
        loading={counterpartyListStatus.isLoading}
        error={counterpartyListStatus.isError}
        helperText={counterpartyListStatus.errorMsg}
        onChange={(event) => {
          setCounterpartyId(event.target.value || undefined);
        }}
      >
        {counterpartyOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <Button type="button" variant="text" onClick={reset}>
        Сбросить
      </Button>
    </Wrapper>
  );
});
