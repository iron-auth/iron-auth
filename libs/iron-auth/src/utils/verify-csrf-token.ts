import type { InternalRequest, ParsedIronAuthConfig } from '../../types';
import { getCookie } from './cookie';
import { hash } from './encryption';
import { IronAuthError } from './iron-auth-error';

/**
 * Verify a CSRF token is valid.
 *
 * @param cookie The CSRF cookie value.
 * @param config Iron Auth config.
 * @param rawToken The raw CSRF token (excluding hash).
 * @returns Whether the CSRF token is valid.
 */
export const verifyCsrfToken = async (
  cookie: string | undefined,
  rawToken: string,
  config: ParsedIronAuthConfig,
) => {
  const [token, tokenHash] = cookie?.split('_') ?? '';

  if (!token || !tokenHash) {
    return false;
  }

  const expected = await hash(`${token}${config.csrfSecret}`);

  const hashesMatch = tokenHash === expected;
  const tokensMatch = token === rawToken;

  return hashesMatch && tokensMatch;
};

export const verifyCsrfTokenForReq = async (req: InternalRequest, config: ParsedIronAuthConfig) => {
  const { csrfToken } = req.body;

  const securePrefix =
    (config.csrfOptions?.secure ?? true) && (config.csrfOptions?.path ?? '/') === '/';

  const cookie = getCookie(req, config.csrfOptions?.name ?? 'iron-auth.csrf', securePrefix);

  if (!cookie || typeof csrfToken !== 'string') {
    throw new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' });
  }

  const valid = await verifyCsrfToken(cookie, csrfToken, config);

  if (!valid) {
    throw new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' });
  }

  return valid;
};

export const validateCsrfToken = async (config: ParsedIronAuthConfig, req: InternalRequest) => {
  if (!(await verifyCsrfTokenForReq(req, config))) {
    throw new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' });
  }
};
