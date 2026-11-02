import { ListsDTO } from '../../dto/common/lists';

export namespace IdentityDTO {
  import WithPagination = ListsDTO.WithPagination;
  export type UserPersonalInfo = {
    displayedName: string;
    avatarHexColor: string;
    shortDisplayedName: string;
    fullName?: {
      name: string;
      surname: string;
      patronymic?: string;
    };
    birthDate?: string;
  };

  export type UserContacts = {
    email?: string;
    phone?: string;
    esiaId?: string;
    telegramId?: string;
  };

  export type UserLogout = {
    redirectUrl: string;
  };

  export type Organization = {
    id: string;
    inn: string;
    kpp?: string;
    name: string;
    ogrn?: string;
    permissions?: string[];
  };

  export type OrganizationsList = WithPagination<Organization>;

  export type UserID = string;
}
