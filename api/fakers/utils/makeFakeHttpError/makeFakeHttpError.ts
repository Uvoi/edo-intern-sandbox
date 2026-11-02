import { ApiHTTPError } from '../../../services/MainApiHttpClient';

/**
 * Имитирует ошибку сервера с задержкой
 */
export const makeFakeHttpError = (
  message: string,
  timeout: number,
): Promise<never> =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        new ApiHTTPError({
          errors: [{ message, additionalInfo: {} }],
          config: undefined,
        }),
      );
    }, timeout);
  });
