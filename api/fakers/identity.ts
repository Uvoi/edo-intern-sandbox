import { normalizePhone } from '#shared/utils/normalizePhone';

import { type IdentityDTO } from '../dto/identity';
import { faker } from '../services/Faker';

export const identityFaker = {
  makePersonalInfo: (
    data?: Partial<IdentityDTO.UserPersonalInfo>,
  ): IdentityDTO.UserPersonalInfo => ({
    displayedName: faker.person.fullName(),
    avatarHexColor: faker.color.rgb(),
    shortDisplayedName: 'ВВ',
    fullName: {
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      patronymic: faker.person.middleName(),
    },
    birthDate: faker.date.birthdate().toISOString(),
    ...data,
  }),

  makeUserContacts: (
    data?: Partial<IdentityDTO.UserContacts>,
  ): IdentityDTO.UserContacts => ({
    email: faker.internet.email(),
    phone: normalizePhone(faker.phone.number()),
    ...data,
  }),

  makeKpp: () => {
    return String(
      faker.number.int({
        min: 100000000,
        max: 999999999,
      }),
    );
  },

  makeOrganization: (): IdentityDTO.Organization => ({
    id: faker.string.uuid(),
    inn: String(
      faker.number.int({
        min: 100000000000,
        max: 999999999999,
      }),
    ),
    kpp: identityFaker.makeKpp(),
    name: faker.company.name(),
    ogrn: String(
      faker.number.int({
        min: 1000000000000,
        max: 9999999999999,
      }),
    ),
  }),

  makeOrganizationList: (): IdentityDTO.OrganizationsList => ({
    data: [
      {
        id: '9cbab174-f105-4e0a-b068-c1680fe01ef0',
        name: 'АО "Крылья и Плавники"',
        inn: '4029017981',
        kpp: '201344001',
        ogrn: '1024001434049',
      },
      {
        id: '11636e6a-4662-477d-81a6-72ad71441afb',
        name: 'ИП АвтоТранс',
        inn: '965995309568',
        ogrn: '343987195447513',
      },
      {
        id: '623c2065-eb72-47de-963f-75ef6ea6e809',
        name: 'ИП Гаврилова Вера Львовна',
        inn: '969295862446',
        ogrn: '303045878472828',
      },
      ...Array.from({ length: 20 }, () => identityFaker.makeOrganization()),
    ],
    meta: {
      totalCount: 23,
    },
  }),
};
