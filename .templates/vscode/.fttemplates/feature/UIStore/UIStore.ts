import { makeAutoObservable } from 'mobx';

export class UIStore {
  public constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }
}

export const createUIStore = () => new UIStore();
