import { type HttpServiceResponse } from '../../../services/HttpService';

export const makeFakeHttpRes = <TResponse>(
  data: TResponse,
): HttpServiceResponse<TResponse> => ({
  headers: {},
  status: 200,
  statusText: 'success',
  data,
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: {} as any,
});
