import { type counterpartyEndpoints } from '../../_endpoints/counterparty';
import { type CounterpartyDTO } from '../../dto/counterparty';
import { faker } from '../../services/Faker';
import { counterpartyFaker } from '../counterparty';
import { makeFakeHttpPromise } from '../utils/makeFakeHttpPromise';

const FAKE_DELAY = 600;

const FAKE_SEED = 42;

let counterpartyDB: CounterpartyDTO.Counterparty[] | undefined;

/**
 * Фейковая «база» контрагентов. Создается один раз с фиксированным seed,
 * чтобы между перезагрузками страницы данные не менялись
 */
export const getFakeCounterpartyDB = () => {
  if (!counterpartyDB) {
    faker.seed(FAKE_SEED);

    counterpartyDB = counterpartyFaker.makeCounterpartyList({
      length: 25,
    }).data;
  }

  return counterpartyDB;
};

export const fakeCounterpartyEndpoints: typeof counterpartyEndpoints = {
  getCounterpartyList: (params) => {
    const search = params?.search?.trim().toLowerCase();

    const data = getFakeCounterpartyDB().filter(
      ({ name, inn }) =>
        !search || name.toLowerCase().includes(search) || inn.includes(search),
    );

    return makeFakeHttpPromise(
      { data, meta: { totalCount: data.length } },
      FAKE_DELAY,
    );
  },
};
