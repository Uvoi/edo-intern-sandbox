import { type CounterpartyDTO } from '../dto/counterparty';
import { faker } from '../services/Faker';

export const counterpartyFaker = {
  makeCounterparty: (
    data?: Partial<CounterpartyDTO.Counterparty>,
  ): CounterpartyDTO.Counterparty => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    inn: faker.string.numeric(10),
    kpp: faker.string.numeric(9),
    isArchived: false,
    ...data,
  }),

  makeCounterpartyList: ({
    length,
    item,
  }: {
    length: number;
    item?: Partial<CounterpartyDTO.Counterparty>;
  }): CounterpartyDTO.CounterpartyList => ({
    data: Array.from({ length }, () =>
      counterpartyFaker.makeCounterparty(item),
    ),
    meta: { totalCount: length },
  }),
};
