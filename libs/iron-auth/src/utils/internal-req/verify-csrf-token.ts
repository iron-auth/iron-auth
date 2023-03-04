import type { InternalRequest, ParsedIronAuthConfig } from '../../../types';
import { hash } from '../encryption';
import { getCookie, hasSecurePrefix } from '../http-helpers';
import { IronAuthError } from '../iron-auth-error';

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

  const expected = await hash(`${token}${config.secrets.csrf}`);

  const hashesMatch = tokenHash === expected;
  const tokensMatch = token === rawToken;

  return hashesMatch && tokensMatch;
};

export const verifyCsrfTokenForReq = async (req: InternalRequest, config: ParsedIronAuthConfig) => {
  const { csrfToken } = req.body;

  const cookie = getCookie(req, config.cookies.csrf.name, hasSecurePrefix(config.cookies.csrf));

  if (!cookie || typeof csrfToken !== 'string') {
    console.log('no cookie or no csrfToken', cookie, csrfToken);
    throw new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' });
  }

  const valid = await verifyCsrfToken(cookie, csrfToken, config);

  if (!valid) {
    console.log('not valid', cookie, csrfToken);
    throw new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' });
  }

  return valid;
};

export const validateCsrfToken = async (config: ParsedIronAuthConfig, req: InternalRequest) => {
  if (!(await verifyCsrfTokenForReq(req, config))) {
    throw new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' });
  }
};
