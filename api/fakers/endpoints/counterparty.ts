import { type counterpartyEndpoints } from '../../_endpoints/counterparty';
import { type CounterpartyDTO } from '../../dto/counterparty';
import { faker } from '../../services/Faker';
import { counterpartyFaker } from '../counterparty';
import { makeFakeHttpError } from '../utils/makeFakeHttpError';
import { makeFakeHttpPromise } from '../utils/makeFakeHttpPromise';

const FAKE_DELAY = 600;

const FAKE_SEED = 42;

const ARCHIVE_ERROR_NAME = 'ООО Учебная ошибка архивации';

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

    const errorRowIndex = counterpartyDB.length - 1;
    counterpartyDB[errorRowIndex] = {
      ...counterpartyDB[errorRowIndex],
      name: ARCHIVE_ERROR_NAME,
    };
  }

  return counterpartyDB;
};

export const fakeCounterpartyEndpoints: typeof counterpartyEndpoints = {
  changeArchiveState: ({ id, isArchived }) => {
    const db = getFakeCounterpartyDB();
    const index = db.findIndex((counterparty) => counterparty.id === id);

    if (index === -1) {
      return makeFakeHttpError('Контрагент не найден', FAKE_DELAY);
    }
    if (db[index].name === ARCHIVE_ERROR_NAME) {
      return makeFakeHttpError(
        'Учебная ошибка: состояние контрагента не изменено',
        FAKE_DELAY,
      );
    }

    // Новый объект: старые ответы query не меняются до инвалидации и перезапроса.
    const updatedCounterparty = { ...db[index], isArchived };
    db[index] = updatedCounterparty;

    return makeFakeHttpPromise(updatedCounterparty, FAKE_DELAY);
  },
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
