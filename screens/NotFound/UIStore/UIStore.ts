import { makeAutoObservable } from 'mobx';

import { type Router, router } from '#shared/services/Router';

class UIStore {
  public constructor(private readonly _router: Router) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get homePagePath() {
    return this._router.routes.main.generateHref();
  }
}

export const createUIStore = () => new UIStore(router);
