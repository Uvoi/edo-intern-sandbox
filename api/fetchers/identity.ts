import { fakeIdentityEndpoints } from '../fakers/endpoints/identity';
import { cacheService } from '../services/CacheService';

// В песочнице нет сервера авторизации, поэтому все данные пользователя отдает stub из fakers
export const identityFetcher = {
  queries: {
    personalInfo: cacheService.createQuerySet(() => ({
      execute: () =>
        fakeIdentityEndpoints.getPersonalInfo().then(({ data }) => data),
    })),
    contacts: cacheService.createQuerySet(() => ({
      execute: () =>
        fakeIdentityEndpoints.getContacts().then(({ data }) => data),
    })),
    organizations: cacheService.createQuerySet(() => ({
      execute: () =>
        fakeIdentityEndpoints.getOrganizationList().then(({ data }) => data),
    })),
    userId: cacheService.createQuerySet(() => ({
      execute: () => fakeIdentityEndpoints.getUserId().then(({ data }) => data),
    })),
  },
  mutations: {
    logout: cacheService.createMutationSet(() =>
      fakeIdentityEndpoints.logout(),
    ),
  },
};

export type IdentityFetcher = typeof identityFetcher;
