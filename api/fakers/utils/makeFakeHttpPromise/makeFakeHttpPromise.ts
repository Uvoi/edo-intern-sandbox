import { type HttpServiceResponse } from '../../../services/HttpService';
import { makeFakeHttpRes } from '../makeFakeHttpRes';

/**
 * @lintignore knip
 */
export const makeFakeHttpPromise = <TResponse>(
  response: TResponse,
  timeout: number,
): Promise<HttpServiceResponse<TResponse>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(makeFakeHttpRes(response));
    }, timeout);
  });
};
