import { observer } from 'mobx-react-lite';

import { DashboardLayout } from '#shared/components/DashboardLayout';
import { useStore } from '#shared/hooks/useStore';

import { createUIStore } from './UIStore';

export const Sidebar = observer(() => {
  const { menuListItems } = useStore(createUIStore);

  return <DashboardLayout.Sidebar menu={{ items: menuListItems }} />;
});
