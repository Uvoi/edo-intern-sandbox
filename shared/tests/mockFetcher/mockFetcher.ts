import {
  type InfiniteQuerySet,
  type MutationSet,
  type QuerySet,
} from '@astral/mobx-query';

import { type DeepPartial } from '../../types/utilityTypes';

type Fetcher = {
  // biome-ignore lint/suspicious/noExplicitAny: any используется для вывода типов
  queries?: Record<string, QuerySet<any[], any>>;
  // biome-ignore lint/suspicious/noExplicitAny: any используется для вывода типов
  infiniteQueries?: Record<string, InfiniteQuerySet<any[], any>>;
  // biome-ignore lint/suspicious/noExplicitAny: any используется для вывода типов
  mutations?: Record<string, MutationSet<any, any>>;
};

export const mockFetcher = <TFetcher extends Fetcher>(
  config: DeepPartial<TFetcher>,
) => config as TFetcher;
