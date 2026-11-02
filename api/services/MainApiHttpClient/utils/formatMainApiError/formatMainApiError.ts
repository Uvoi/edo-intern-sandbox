import {
  BAD_REQUEST_ERROR_INFO,
  FORBIDDEN_HTTP_CODE,
  type HttpServiceError,
  INTERNAL_ERROR_INFO,
  NOT_FOUND_ERROR_INFO,
  UNAUTHORIZED_HTTP_INFO,
} from '../../../HttpService';
import { ApiHTTPError } from '../../error';

export type ApiErrorInfo = {
  statusCode: number;
  errorMessage?: string;
  errors?: Array<{
    message: string;
    additionalInfo: {
      errorCustomField?: string;
    };
  }>;
};

const getMainApiErrorRes = (
  error: HttpServiceError<ApiErrorInfo, ApiErrorInfo>,
): ApiErrorInfo => {
  if (error?.response?.status === UNAUTHORIZED_HTTP_INFO.code) {
    return {
      statusCode: UNAUTHORIZED_HTTP_INFO.code,
      errors: [
        {
          message: UNAUTHORIZED_HTTP_INFO.message,
          additionalInfo: {},
        },
      ],
    };
  }

  // Если нет response, то это Network Error (403...)
  return (
    error.response?.data || {
      statusCode: FORBIDDEN_HTTP_CODE,
      errors: [
        {
          message: INTERNAL_ERROR_INFO.message,
          additionalInfo: {},
        },
      ],
    }
  );
};

export const formatMainApiError = (
  mainApiError: HttpServiceError<ApiErrorInfo, ApiErrorInfo>,
): ApiHTTPError => {
  const errorResponse: ApiErrorInfo = getMainApiErrorRes(mainApiError);

  const { statusCode } = errorResponse;

  if (errorResponse.errors?.length) {
    return new ApiHTTPError({
      config: mainApiError.config,
      errors: errorResponse.errors,
    });
  }

  switch (statusCode) {
    case BAD_REQUEST_ERROR_INFO.code:
      return new ApiHTTPError({
        config: mainApiError.config,
        errors: [
          {
            message: BAD_REQUEST_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      });

    case NOT_FOUND_ERROR_INFO.code:
      return new ApiHTTPError({
        config: mainApiError.config,
        errors: [
          {
            message: NOT_FOUND_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      });

    default:
      return new ApiHTTPError({
        config: mainApiError.config,
        errors: [
          {
            message: INTERNAL_ERROR_INFO.message,
            additionalInfo: {},
          },
        ],
      });
  }
};
