import { when } from 'mobx';
import { describe, expect, it } from 'vitest';

import { identityFaker } from '#api/fakers/identity';
import { type IdentityFetcher } from '#api/fetchers/identity';
import { createCacheService } from '#api/services/CacheService';
import { mockFetcher } from '#shared/tests/mockFetcher';

import { IdentityStore } from './IdentityStore';

describe('IdentityStore', () => {
  it('Данные пользователя содержат: персональные данные, id и контакты', async () => {
    const cacheService = createCacheService();

    const fakePersonalInfo = identityFaker.makePersonalInfo();
    const fakeContacts = identityFaker.makeUserContacts();
    const fakeUserId = '1';

    const identityFetcherMock = mockFetcher<IdentityFetcher>({
      queries: {
        personalInfo: cacheService.createQuerySet(() => ({
          execute: async () => fakePersonalInfo,
        })),
        contacts: cacheService.createQuerySet(() => ({
          execute: async () => fakeContacts,
        })),
        userId: cacheService.createQuerySet(() => ({
          execute: async () => fakeUserId,
        })),
      },
    });

    const sut = new IdentityStore(identityFetcherMock);

    await when(() => Boolean(sut.userInfo));

    expect(sut.userInfo).toMatchObject({
      id: fakeUserId,
      displayedName: fakePersonalInfo.displayedName,
      phone: fakeContacts.phone,
    });
  });
});
