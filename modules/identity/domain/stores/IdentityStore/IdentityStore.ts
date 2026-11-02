import { makeAutoObservable } from 'mobx';

import { type IdentityDTO } from '#api/dto/identity';
import { type IdentityFetcher, identityFetcher } from '#api/fetchers/identity';

type UserInfo = {
  id: IdentityDTO.UserID;
} & IdentityDTO.UserPersonalInfo &
  IdentityDTO.UserContacts;

export class IdentityStore {
  public constructor(private readonly _identityFetcher: IdentityFetcher) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get userInfoStatus() {
    return {
      isLoading:
        this.personalInfoQuery.isLoading ||
        this.contactsQuery.isLoading ||
        this.userIdQuery.isLoading,
      isError:
        this.personalInfoQuery.isError ||
        this.contactsQuery.isError ||
        this.userIdQuery.isError,
      error:
        this.personalInfoQuery.error ||
        this.contactsQuery.error ||
        this.userIdQuery.error,
    };
  }

  public get userInfo(): UserInfo | undefined {
    const userId = this.userIdQuery.data;
    const personalInfo = this.personalInfoQuery.data;
    const contacts = this.contactsQuery.data;

    if (!userId || !personalInfo || !contacts) {
      return undefined;
    }

    return {
      id: this.userIdQuery.data,
      ...this.personalInfoQuery.data,
      ...this.contactsQuery.data,
    };
  }

  public logout = () => {
    return this._identityFetcher.mutations.logout.create().async();
  };

  private get personalInfoQuery() {
    return this._identityFetcher.queries.personalInfo.create();
  }

  private get contactsQuery() {
    return this._identityFetcher.queries.contacts.create();
  }

  private get userIdQuery() {
    return this._identityFetcher.queries.userId.create();
  }
}

export const identityStore = new IdentityStore(identityFetcher);
