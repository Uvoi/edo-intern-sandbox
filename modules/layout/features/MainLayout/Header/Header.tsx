import { observer } from 'mobx-react-lite';

import { AstralProductSwitcher } from '#shared/components/AstralProductSwitcher';
import { DashboardLayout } from '#shared/components/DashboardLayout';
import { Divider } from '#shared/components/Divider';
import { ListItemIcon } from '#shared/components/ListItemIcon';
import { ListItemText } from '#shared/components/ListItemText';
import { Menu } from '#shared/components/Menu';
import { MenuItem } from '#shared/components/MenuItem';
import { useStore } from '#shared/hooks/useStore';
import { LogoIcon } from '#shared/icons/LogoIcon';
import { ProfileOutlineMd } from '#shared/icons/ProfileOutlineMd';
import { QuitOutlineMd } from '#shared/icons/QuitOutlineMd';

import { createUIStore } from './UIStore';

export const Header = observer(() => {
  const {
    userName,
    email,
    avatarColor,
    redirectToRoot,
    logout,
    identityUrl,
    personAreaUrl,
  } = useStore(createUIStore);

  return (
    <DashboardLayout.Header
      product={{
        name: 'ЭДО Песочница',
        logo: () => <LogoIcon />,
        onClick: redirectToRoot,
      }}
      productSwitcher={() => (
        <AstralProductSwitcher identityUrl={identityUrl} />
      )}
      profile={{
        displayName: userName,
        annotation: email,
        avatar: { sx: { background: avatarColor }, alt: userName },
        menu: (props) => (
          <Menu {...props}>
            <MenuItem component="a" href={personAreaUrl}>
              <ListItemIcon>
                <ProfileOutlineMd />
              </ListItemIcon>
              <ListItemText>Мой профиль</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <QuitOutlineMd />
              </ListItemIcon>
              <ListItemText>Выйти</ListItemText>
            </MenuItem>
          </Menu>
        ),
      }}
    />
  );
});
