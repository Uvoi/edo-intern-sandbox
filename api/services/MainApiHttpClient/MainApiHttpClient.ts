import {
  createHttpService,
  type HttpServiceError,
  UNAUTHORIZED_HTTP_CODE,
} from '../HttpService';
import { type ApiHTTPError } from './error';
import { formatMainApiError } from './utils';

/**
 * Http client для взаимодействия с основным api
 * */
export const mainApiHttpClient = createHttpService();

type UnauthorizedApiError = {
  redirectUrl: string;
};

/**
 * Инициализация apiHttpClient
 */
export const initMainApiHttpClient = () => {
  mainApiHttpClient.init({
    baseURL: '/auth-api',
  });

  mainApiHttpClient.initErrorFormatter<ApiHTTPError>(formatMainApiError);

  // Редирект на авторизацию, если пришла 401
  mainApiHttpClient.subscribeOnError((error) => {
    if (Number(error?.response?.status) === UNAUTHORIZED_HTTP_CODE) {
      window.location.href = (
        error as HttpServiceError<UnauthorizedApiError, UnauthorizedApiError>
      ).response?.data.redirectUrl as string;
    }
  });
};
