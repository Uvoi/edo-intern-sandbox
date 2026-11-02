import { MobxRouter } from '@astral/mobx-router';
import { ReactRouterProvider } from '@astral/mobx-router-react';

export const reactRouterProvider = new ReactRouterProvider();

const routesConfig = {
  main: MobxRouter.defineRoute({ pattern: '/' }),
  counterparties: MobxRouter.defineRoute({ pattern: '/counterparties' }),
};

export const router = new MobxRouter(reactRouterProvider, routesConfig);

export type Router = typeof router;
