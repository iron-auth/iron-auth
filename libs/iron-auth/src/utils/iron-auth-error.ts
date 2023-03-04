export const codeToStatus = {
  INTERNAL_SERVER_ERROR: 500,
  UNAUTHORIZED: 401,
  NO_SESSION: 401,
  BAD_REQUEST: 400,
  CONFIG_ERROR: 500,
  INVALID_CSRF_TOKEN: 403,
  NOT_FOUND: 404,
  INVALID_OAUTH_COOKIE: 403,
} as const;

type Args = {
  /**
   * The Iron Auth error code.
   */
  code?: keyof typeof codeToStatus;
  /**
   * The error message.
   */
  message?: string;
};

/**
 * Class for errors thrown in the Iron Auth library.
 */
export class IronAuthError extends Error {
  /**
   * Iron Auth error code.
   */
  code: keyof typeof codeToStatus;

  /**
   * HTTP status code for the error.
   */
  status: (typeof codeToStatus)[typeof this.code];

  /**
   * Construct a new error for the Iron Auth library.
   *
   * @param args.code - The Iron Auth error code.
   * @param args.message - The error message.
   */
  constructor({ code = 'CONFIG_ERROR', message = 'An error occurred' }: Args = {}) {
    super(message);

    this.code = code;
    this.status = codeToStatus[code];
  }
}

export type { Args as IronAuthErrorArgs };
