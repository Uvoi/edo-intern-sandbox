import { type AxiosRequestConfig } from 'axios';

type HTTPErrorItem<TAdditionalInfo extends Record<string, unknown>> = {
  message: string;
  additionalInfo: TAdditionalInfo;
};

export class HTTPError<
  TAdditionalInfo extends Record<string, unknown>,
> extends Error {
  public errors: HTTPErrorItem<TAdditionalInfo>[];
  public config: AxiosRequestConfig | undefined;

  public constructor({
    errors,
    config,
  }: {
    errors: HTTPErrorItem<TAdditionalInfo>[];
    config: AxiosRequestConfig | undefined;
  }) {
    super(errors[0].message);
    this.errors = errors;
    this.config = config;
  }
}
