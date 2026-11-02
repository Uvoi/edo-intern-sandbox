import { createRouterMockFactory } from '@astral/mobx-router/_mocks';

import { router } from '../../services/Router';

/**
 * @lintignore knip
 */
export const createRouterMock = createRouterMockFactory(router);
