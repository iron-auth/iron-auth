import type { NextApiResponse } from 'next';
import type {
  ApiResponseDataType,
  EdgeResponse,
  IronAuthApiResponse,
  ParsedIronAuthConfig,
} from '../../types';
import { codeToStatus as errorCodeToStatus, IronAuthError } from './iron-auth-error';

const codeToStatus = {
  OK: 200,
};

const jointCodeToStatus = {
  ...codeToStatus,
  ...errorCodeToStatus,
};

export const redirectCodeToStatus = {
  MULTIPLE_CHOICE: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
};

export type JointStatusCodes = keyof typeof jointCodeToStatus;
export type ErrorStatusCodes = keyof typeof errorCodeToStatus;

type Props<T extends ApiResponseDataType> = {
  /**
   * The Iron Auth response code.
   */
  code?: keyof typeof jointCodeToStatus;
  /**
   * The data to be returned in the response.
   */
  data?: T;
  /**
   * The response object for the API.
   */
  res?: NextApiResponse | EdgeResponse;
  /**
   * The redirect object for the response.
   */
  redirect?: {
    /**
     * Internal Iron Auth redirect status code.
     */
    code: keyof typeof redirectCodeToStatus;
    /**
     * The URL to redirect to.
     */
    url: string;
  };

  err?: Error;
  route?: keyof NonNullable<ParsedIronAuthConfig['redirects']>;
};

/**
 * Class for creating a response object for the Iron Auth library API.
 */
export class IronAuthResponse<T extends ApiResponseDataType> {
  /**
   * The data to be returned in the response.
   */
  readonly data: T;

  /**
   * Iron Auth response status code
   */
  readonly code: keyof typeof jointCodeToStatus;

  /**
   * HTTP status code for the response.
   */
  readonly status: typeof jointCodeToStatus[typeof this.code];

  /**
   * The redirect object for the response.
   *
   * If this is undefined, the response will not be a redirect.
   */
  readonly redirect?: {
    /**
     * Internal Iron Auth redirect status code.
     */
    readonly code: keyof typeof redirectCodeToStatus;
    /**
     * HTTP status code for the redirect.
     */
    readonly status: typeof redirectCodeToStatus[keyof typeof redirectCodeToStatus];
    /**
     * The URL to redirect to.
     */
    readonly url: string;
  };

  readonly err?: Error;

  /**
   * The response object for the API.
   */
  readonly res?: NextApiResponse | EdgeResponse;

  readonly route?: keyof NonNullable<ParsedIronAuthConfig['redirects']>;

  /**
   * Construct a new Iron Auth response object.
   *
   * @param props.code - The Iron Auth response code.
   * @param props.data - The data to be returned in the response.
   * @param props.redirect - The redirect object for the response.
   * @param props.res - The response object for the API.
   */
  constructor({ code = 'OK', data = {} as T, redirect, res, err, route }: Props<T>) {
    this.data = data;

    this.code = code;
    this.status = jointCodeToStatus[code];

    this.redirect = redirect
      ? {
          code: redirect.code,
          status: redirectCodeToStatus[redirect.code],
          url: redirect.url,
        }
      : undefined;

    this.res = res;
    this.err = err;
    this.route = route;
  }

  /**
   * Convert the response object to a JSON object to be sent to the user.
   *
   * @returns The JSON object to be sent to the user.
   */
  toJson(): IronAuthApiResponse<'success', T> {
    return {
      success: true,
      code: this.code,
      data: this.data,
    };
  }

  /**
   * Convert the response object to a stringified form of its JSON interpretation to be sent to the user.
   *
   * @returns Stringified JSON object to be sent to the user.
   */
  toString() {
    return JSON.stringify(this.toJson());
  }

  /**
   * Parse an error object into a response.
   *
   * @param error - The error thrown durin the API call. It can be any error, not strictly an IronAuthError.
   * @returns The JSON object to be sent to the user.
   */
  static parseError(error: unknown): {
    status: typeof errorCodeToStatus[keyof typeof errorCodeToStatus];
    body: IronAuthApiResponse<'error'>;
  } {
    if (error instanceof IronAuthError) {
      return {
        status: error.status,
        body: {
          success: false,
          code: error.code,
          error: error.message,
        },
      };
    }

    return {
      status: 500,
      body: {
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        error: 'An unexpected error occurred',
      },
    };
  }
}

export type { Props as IronAuthResponseProps };
