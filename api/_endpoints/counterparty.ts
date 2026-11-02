import { type CounterpartyDTO } from '../dto/counterparty';
import { mainApiHttpClient } from '../services/MainApiHttpClient';

export const counterpartyEndpoints = {
  getCounterpartyList: (params?: CounterpartyDTO.CounterpartyListInput) =>
    mainApiHttpClient.get<CounterpartyDTO.CounterpartyList>(
      '/counterparty/list',
      { params },
    ),
};
