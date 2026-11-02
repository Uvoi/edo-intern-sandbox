import { type CounterpartyDTO } from '../dto/counterparty';
import { fakeCounterpartyEndpoints } from '../fakers/endpoints/counterparty';
import { cacheService } from '../services/CacheService';

export const counterpartyFetcher = {
  queries: {
    counterpartyList: cacheService.createQuerySet(
      (params?: CounterpartyDTO.CounterpartyListInput) => ({
        // Contract First: пока нет backend, данные отдает stub из fakers.
        // Когда появится API — заменить на counterpartyEndpoints
        execute: () =>
          fakeCounterpartyEndpoints
            .getCounterpartyList(params)
            .then(({ data }) => data),
      }),
    ),
  },
};

export type CounterpartyFetcher = typeof counterpartyFetcher;
