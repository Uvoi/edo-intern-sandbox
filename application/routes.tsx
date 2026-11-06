import { ProviderAdapter } from '@astral/mobx-router-react';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router';

import { MainLayout } from '#modules/layout/features/MainLayout';
import { NotFoundScreen } from '#screens/NotFound';
import { ContentState } from '#shared/components/ContentState';
import { reactRouterProvider, router } from '#shared/services/Router';

const IndexPage = lazy(() => import('./pages/index'));

const CounterpartiesPage = lazy(() => import('./pages/counterparties'));
const DocumentsPage = lazy(() => import('./pages/documents'));

export const browserRouter = createBrowserRouter([
  {
    element: (
      <>
        <ProviderAdapter provider={reactRouterProvider} />
        <MainLayout>
          <Suspense
            fallback={<ContentState isLoading>loading...</ContentState>}
          >
            <Outlet />
          </Suspense>
        </MainLayout>
      </>
    ),
    children: [
      {
        path: router.routes.main.pattern,
        element: <IndexPage />,
      },
      {
        path: router.routes.counterparties.pattern,
        element: <CounterpartiesPage />,
      },
      {
        path: router.routes.documents.pattern,
        element: <DocumentsPage />,
      },
      {
        path: '*',
        element: <NotFoundScreen />,
      },
    ],
  },
]);
