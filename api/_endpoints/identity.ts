import { type IdentityDTO } from '../dto/identity';
import { mainApiHttpClient } from '../services/MainApiHttpClient';

export const identityEndpoints = {
  logout: () =>
    mainApiHttpClient.post<IdentityDTO.UserLogout>('/identity/accounts/logout'),
  getPersonalInfo: () =>
    mainApiHttpClient.get<IdentityDTO.UserPersonalInfo>(
      '/identity/accounts/personal',
    ),
  getContacts: () =>
    mainApiHttpClient.get<IdentityDTO.UserContacts>(
      '/identity/accounts/contact',
    ),
  getOrganizationList: () =>
    mainApiHttpClient.get<IdentityDTO.OrganizationsList>(
      '/identity/accounts/organizations',
    ),
  getUserId: () => mainApiHttpClient.get<IdentityDTO.UserID>('/identity/id'),
};
