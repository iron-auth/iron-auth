import type { IncomingResponse, InternalRequest, ParsedIronAuthConfig } from '../../types';
import { hash, setCookie } from '../utils';

export const csrfRoute = async (
  _req: InternalRequest,
  res: IncomingResponse,
  config: ParsedIronAuthConfig,
) => {
  // Generate a random string to use as a CSRF token
  const csrfToken = crypto.randomUUID().replace(/-/g, '');

  const hashed = await hash(`${csrfToken}${config.csrfSecret}`);
  const token = `${csrfToken}_${hashed}`;

  setCookie(
    res,
    { name: config.csrfOptions?.name ?? 'iron-auth.csrf', value: token },
    config.csrfOptions,
  );

  return csrfToken;
};
