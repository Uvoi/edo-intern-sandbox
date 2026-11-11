import { type CounterpartyDTO } from '../dto/counterparty';
import { mainApiHttpClient } from '../services/MainApiHttpClient';

export const counterpartyEndpoints = {
  // Учебный контракт. В песочнице вызывается только соответствующий stub.
  changeArchiveState: (params: CounterpartyDTO.ChangeArchiveStateInput) =>
    mainApiHttpClient.post<CounterpartyDTO.Counterparty>(
      '/counterparty/archive-state',
      params,
    ),
  getCounterpartyList: (params?: CounterpartyDTO.CounterpartyListInput) =>
    mainApiHttpClient.get<CounterpartyDTO.CounterpartyList>(
      '/counterparty/list',
      { params },
    ),
};
