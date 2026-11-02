import { type identityEndpoints } from '../../_endpoints/identity';
import { identityFaker } from '../identity';
import { makeFakeHttpPromise } from '../utils/makeFakeHttpPromise';

const FAKE_DELAY = 300;

export const fakeIdentityEndpoints: typeof identityEndpoints = {
  logout: () => makeFakeHttpPromise({ redirectUrl: '/' }, FAKE_DELAY),
  getPersonalInfo: () =>
    makeFakeHttpPromise(
      identityFaker.makePersonalInfo({
        displayedName: 'Иову Дмитрий',
        shortDisplayedName: 'ИД',
        avatarHexColor: '#2E7D32',
      }),
      FAKE_DELAY,
    ),
  getContacts: () =>
    makeFakeHttpPromise(
      identityFaker.makeUserContacts({ email: 'intern@example.com' }),
      FAKE_DELAY,
    ),
  getOrganizationList: () =>
    makeFakeHttpPromise(identityFaker.makeOrganizationList(), FAKE_DELAY),
  getUserId: () =>
    makeFakeHttpPromise('00000000-0000-4000-8000-000000000001', FAKE_DELAY),
};
