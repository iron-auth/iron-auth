import type { ApiResponseDataType, IronAuthApiResponse } from '../../../types';
import type { routesGET, routesPOST } from '../../routes';
import { codeToStatus as errorCodeToStatus, IronAuthError } from '../iron-auth-error';

const codeToStatus = {
  OK: 200,
} as const;

export const redirectCodeToStatus = {
  MULTIPLE_CHOICE: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 302, // Should we use 307 here?
  PERMANENT_REDIRECT: 308,
} as const;

const jointCodeToStatus = {
  ...codeToStatus,
  ...errorCodeToStatus,
  ...redirectCodeToStatus,
} as const;

export type ErrorStatusCodes = keyof typeof errorCodeToStatus;
export type JointStatusCodes = keyof typeof jointCodeToStatus;

export type IronAuthResponse<TData extends ApiResponseDataType = ApiResponseDataType> = {
  routeName: keyof typeof routesGET | keyof typeof routesPOST | 'unknown';
  code: keyof typeof jointCodeToStatus;
  data: TData;
  err?: Error;
  redirect?: string;
};

export const formatError = (err: unknown): IronAuthApiResponse<'error'> => {
  return {
    success: false,
    code: err instanceof IronAuthError ? err.code : 'INTERNAL_SERVER_ERROR',
    error: err instanceof IronAuthError ? err.message : 'An unexpected error occurred',
  };
};

export const formatResponse = <TData extends ApiResponseDataType>(
  resp: IronAuthResponse<TData>,
) => {
  if (resp.err) {
    return formatError(resp.err);
  }

  return {
    success: true,
    code: resp.code,
    data: resp.data,
  } as IronAuthApiResponse<'success', TData>;
};

export const statusToCode = <T extends keyof typeof jointCodeToStatus>(
  status: T,
): (typeof jointCodeToStatus)[T] => jointCodeToStatus[status] ?? 500;
