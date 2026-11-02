import { makeAutoObservable } from 'mobx';

import {
  type IdentityStore,
  identityStore,
} from '#modules/identity/domain/stores/IdentityStore';
import {
  type ConfigService,
  configService,
} from '#shared/services/ConfigService';
import { type Router, router } from '#shared/services/Router';

class UIStore {
  public identityUrl: string;

  public personAreaUrl: string;

  public constructor(
    private readonly _router: Router,
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: используется в конструкторе
    private readonly _configService: ConfigService,
    private readonly _identityStore: IdentityStore,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.identityUrl = _configService.identityUrl;
    this.personAreaUrl = _configService.personAreaUrl;
  }

  public get userName() {
    return this._identityStore.userInfo?.displayedName || '';
  }

  public get userDataStatus() {
    return this._identityStore.userInfoStatus;
  }

  public get email() {
    return this._identityStore.userInfo?.email;
  }

  public get avatarColor() {
    return this._identityStore.userInfo?.avatarHexColor;
  }

  public redirectToRoot = () => {
    this._router.routes.main.navigate();
  };

  public logout = () => {
    return this._identityStore.logout();
  };
}

export const createUIStore = () =>
  new UIStore(router, configService, identityStore);
