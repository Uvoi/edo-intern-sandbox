import MockAdapter from 'axios-mock-adapter';
import { describe, expect, it, vi } from 'vitest';

import { HTTPError } from '../HTTPError';
import { createHttpService } from './HttpService';

describe('HttpService', () => {
  it('Ошибки, получаемые при вызове, отформатированы через formatter, переданный в initErrorFormatter', () => {
    const httpService = createHttpService();

    const fakeError = new HTTPError({
      config: undefined,
      errors: [{ message: 'fake error', additionalInfo: {} }],
    });

    httpService.initErrorFormatter<HTTPError<{}>>(() => fakeError);

    httpService.get('/').catch((err) => {
      expect(err).toEqual(fakeError);
    });
  });

  it('Все подписчики на ошибки вызываются с неформатированной ошибкой при неудачном выполнении запроса', async () => {
    const httpService = createHttpService({ baseURL: '/' });

    httpService.initErrorFormatter<HTTPError<{}>>(
      () =>
        new HTTPError({
          config: undefined,
          errors: [{ message: 'fake error', additionalInfo: {} }],
        }),
    );

    const errorCbSpy1 = vi.fn();
    const errorCbSpy2 = vi.fn();

    httpService.subscribeOnError(errorCbSpy1);
    httpService.subscribeOnError(errorCbSpy2);

    new MockAdapter(httpService).onGet('/').networkError();

    try {
      await httpService.get('/');
    } catch (_) {
      expect(errorCbSpy1.mock.calls[0][0].message).toBe('Network Error');
      expect(errorCbSpy2.mock.calls[0][0].message).toBe('Network Error');
    }
  });

  it('Все подписчики на ошибки вызываются с неформатированной ошибкой при retry запроса', async () => {
    const httpService = createHttpService({ baseURL: '/' });
    httpService.initErrorFormatter<HTTPError<{}>>(
      (error) =>
        new HTTPError({
          config: error.config,
          errors: [{ message: 'fake error', additionalInfo: {} }],
        }),
    );

    const errorCbSpy = vi.fn();

    httpService.subscribeOnError(errorCbSpy);

    new MockAdapter(httpService).onGet('/').networkError();

    return httpService.get('/').catch(() => {
      errorCbSpy.mock.calls.forEach(([call]) => {
        expect(call.message).toBe('Network Error');
      });
    });
  });

  it('Подписчики на ошибки вызываются один раз, при retry', async () => {
    const httpService = createHttpService({ baseURL: '/' });
    httpService.initErrorFormatter<HTTPError<{}>>(
      (error) =>
        new HTTPError({
          config: error.config,
          errors: [{ message: 'fake error', additionalInfo: {} }],
        }),
    );

    const mock = new MockAdapter(httpService);
    const errorCbSpy = vi.fn();

    httpService.subscribeOnError(errorCbSpy);
    mock.onGet('/resource').networkError();

    await expect(httpService.get('/resource')).rejects.toBeDefined();

    expect(errorCbSpy).toHaveBeenCalledTimes(1);
  });

  it('Нет retry GET-запроса с 400 ответом сервера', async () => {
    const httpService = createHttpService({ baseURL: '/' });
    const mock = new MockAdapter(httpService);
    mock
      .onGet('/')
      .reply(400, { errors: [{ message: 'Bad Request', additionalInfo: {} }] });
    await expect(httpService.get('/')).rejects.toBeDefined();

    expect(mock.history.get.length).toBe(1);
  });

  it('Есть retry GET-запроса при сетевой ошибке', async () => {
    const httpService = createHttpService({ baseURL: '/' });
    const mock = new MockAdapter(httpService);

    mock.onGet('/resource').networkError();

    await expect(httpService.get('/resource')).rejects.toBeDefined();

    expect(mock.history.get.length).toBe(4);
  });

  it('Есть retry GET-запроса при 500 ответе сервера', async () => {
    const httpService = createHttpService({ baseURL: '/' });
    const mock = new MockAdapter(httpService);

    mock.onGet('/resource').reply(500);

    await expect(httpService.get('/resource')).rejects.toBeDefined();

    expect(mock.history.get.length).toBe(4);
  });
});
