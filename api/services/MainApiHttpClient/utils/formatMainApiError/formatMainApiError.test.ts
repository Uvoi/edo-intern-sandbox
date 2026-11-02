import { describe, expect, it } from 'vitest';

import { type HttpServiceError } from '../../../HttpService';
import { ApiHTTPError } from '../../error';
import { type ApiErrorInfo, formatMainApiError } from './formatMainApiError';

describe('formatMainApiError', () => {
  it('Ошибка содержит дефолтный текст и код ошибки, если пришел 401 код', () => {
    const fakeError = {
      response: {
        status: 401,
      },
    } as HttpServiceError<ApiErrorInfo, ApiErrorInfo>;

    expect(formatMainApiError(fakeError)).toEqual(
      new ApiHTTPError({
        config: fakeError.config,
        errors: [
          { message: 'Пользователь не авторизован', additionalInfo: {} },
        ],
      }),
    );
  });

  it('Ошибка содержит дефолтный текст, если произошла 403 ошибка', () => {
    // axios при 403 не отдает response
    const fakeError = {} as HttpServiceError<ApiErrorInfo, ApiErrorInfo>;

    expect(formatMainApiError(fakeError)).toEqual(
      new ApiHTTPError({
        config: fakeError.config,
        errors: [{ message: 'Неизвестная ошибка', additionalInfo: {} }],
      }),
    );
  });

  it('Ошибка содержит полученный массив ошибок, если он пришел с сервера', () => {
    const fakeError = {
      response: {
        status: 500,
        data: {
          statusCode: 500,
          errors: [{ message: 'error', additionalInfo: {} }],
        },
      },
    } as HttpServiceError<ApiErrorInfo, ApiErrorInfo>;

    expect(formatMainApiError(fakeError)).toEqual(
      new ApiHTTPError({
        config: fakeError.config,
        errors: [{ message: 'error', additionalInfo: {} }],
      }),
    );
  });

  describe('Ошибка содержит дефолтный текст, если пришла ошибка без errors', () => {
    it('Если пришел 400 код', () => {
      const fakeError = {
        response: {
          status: 400,
          data: { statusCode: 400 },
        },
      } as HttpServiceError<ApiErrorInfo, ApiErrorInfo>;

      expect(formatMainApiError(fakeError)).toEqual(
        new ApiHTTPError({
          config: fakeError.config,
          errors: [{ message: 'Ошибка запроса', additionalInfo: {} }],
        }),
      );
    });

    it('Если пришел 404 код', () => {
      const fakeError = {
        response: {
          status: 404,
          data: { statusCode: 404 },
        },
      } as HttpServiceError<ApiErrorInfo, ApiErrorInfo>;

      expect(formatMainApiError(fakeError)).toEqual(
        new ApiHTTPError({
          config: fakeError.config,
          errors: [{ message: 'Сервер не отвечает', additionalInfo: {} }],
        }),
      );
    });
  });
});
