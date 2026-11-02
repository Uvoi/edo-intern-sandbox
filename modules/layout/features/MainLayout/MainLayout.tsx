import { observer } from 'mobx-react-lite';
import { type ReactNode } from 'react';

import { DashboardLayout } from '#shared/components/DashboardLayout';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

type Props = { children: ReactNode };

export const MainLayout = observer(({ children }: Props) => {
  return (
    <DashboardLayout>
      <Header />
      <Sidebar />
      <DashboardLayout.Main>{children}</DashboardLayout.Main>
    </DashboardLayout>
  );
});
