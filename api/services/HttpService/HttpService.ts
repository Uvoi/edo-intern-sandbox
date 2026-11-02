import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosStatic,
} from 'axios';
import axiosRetry from 'axios-retry';
import qs from 'query-string';

import { HTTPError } from '../HTTPError';

type ErrorHandler = (error: HttpServiceError<unknown, unknown>) => unknown;
type ErrorFormatter<
  TCurrentHTTPError extends HTTPError<Record<string, unknown>>,
  // biome-ignore lint/suspicious/noExplicitAny: <>
> = (error: HttpServiceError<any, any>) => TCurrentHTTPError;

interface IHttpService extends AxiosInstance {
  init: (config: HttpServiceInitConfig) => IHttpService;
  subscribeOnError(func: ErrorHandler): void;
  initErrorFormatter<
    TCurrentHTTPError extends HTTPError<Record<string, unknown>>,
  >(func: ErrorFormatter<TCurrentHTTPError>): void;
}

export type HttpServiceError<TData, TConfig> = AxiosError<TData, TConfig>;

/**
 * @lintignore knip
 */
export type HttpServiceResponse<TData, TConfig = TData> = AxiosResponse<
  TData,
  TConfig
>;

type HttpServiceConfig = AxiosRequestConfig;

type HttpServiceInitConfig = Pick<HttpServiceConfig, 'baseURL'>;

export const createHttpService = (
  config: HttpServiceConfig = {},
): IHttpService => {
  const errorListeners: ErrorHandler[] = [];
  let errorFormatter: ErrorFormatter<HTTPError<Record<string, unknown>>> = (
    error,
  ) =>
    new HTTPError({
      config: error.config,
      errors: [{ message: 'Неизвестная ошибка', additionalInfo: {} }],
    });

  const httpService = axios.create({
    timeout: 3000,
    paramsSerializer: {
      serialize: (params) => {
        return qs.stringify(params);
      },
    },
    ...config,
  }) as IHttpService;

  httpService.subscribeOnError = (func) => {
    errorListeners.push(func);
  };

  httpService.initErrorFormatter = (func) => {
    errorFormatter = func;
  };

  axiosRetry(httpService as unknown as AxiosStatic, {
    retries: 3,
    retryDelay: axiosRetry.linearDelay(),
  });

  httpService.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error instanceof HTTPError) {
        return Promise.reject(error);
      }

      errorListeners.forEach((func) => {
        func(error);
      });

      return Promise.reject(errorFormatter(error));
    },
  );

  httpService.init = (newConfig?: HttpServiceInitConfig) => {
    if (newConfig) {
      httpService.defaults.baseURL = newConfig.baseURL;
    }

    return httpService;
  };

  return httpService;
};
