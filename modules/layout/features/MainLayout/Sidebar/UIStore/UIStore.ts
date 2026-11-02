import { makeAutoObservable } from 'mobx';

import { type NavMenuProps } from '#shared/components/NavMenu';
import {
  RouterLink,
  type RouterLinkProps,
} from '#shared/components/RouterLink';
import { DocumentsOutlineMd } from '#shared/icons/DocumentsOutlineMd';
import { PeopleOutlineMd } from '#shared/icons/PeopleOutlineMd';
import { type Router, router } from '#shared/services/Router';
import {
  adaptComponentToDomain,
  type RenderComponentInDomain,
} from '#shared/utils/adaptComponentToDomain';

class UIStore {
  public constructor(
    private readonly _router: Router,
    private readonly _renderRouterLink: RenderComponentInDomain<RouterLinkProps>,
    private readonly _renderMainIcon: RenderComponentInDomain<{}>,
    private readonly _renderCounterpartyIcon: RenderComponentInDomain<{}>,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get menuListItems(): NavMenuProps['items'] {
    return [
      [
        this._router.routes.main.pattern,
        {
          text: 'Главная',
          active: this._router.routes.main.isActive,
          icon: this._renderMainIcon({}),
          component: (props) =>
            this._renderRouterLink({
              ...props,
              to: this._router.routes.main.generateHref(),
            }),
        },
      ],
      [
        this._router.routes.counterparties.pattern,
        {
          text: 'Контрагенты',
          active: this._router.routes.counterparties.isActive,
          icon: this._renderCounterpartyIcon({}),
          component: (props) =>
            this._renderRouterLink({
              ...props,
              to: this._router.routes.counterparties.generateHref(),
            }),
        },
      ],
    ];
  }
}

export const createUIStore = () =>
  new UIStore(
    router,
    adaptComponentToDomain(RouterLink),
    adaptComponentToDomain(DocumentsOutlineMd),
    adaptComponentToDomain(PeopleOutlineMd),
  );
