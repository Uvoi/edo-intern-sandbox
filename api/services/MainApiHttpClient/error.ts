import { HTTPError } from '../HTTPError';

export class ApiHTTPError extends HTTPError<{
  errorCustomField?: string;
}> {}
