import { MobxQuery } from '@astral/mobx-query';

import { type ApiHTTPError } from '../MainApiHttpClient';

export const createCacheService = () =>
  new MobxQuery<ApiHTTPError>({
    enabledAutoFetch: true,
    fetchPolicy: 'cache-first',
  });

export const cacheService = createCacheService();
