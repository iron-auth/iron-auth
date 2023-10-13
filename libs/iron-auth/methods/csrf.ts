import type { GetAuthMethod } from './get-auth-method';
import { getAuthMethod } from './get-auth-method';

/**
 * Fetch a CSRF token to use for post requests.
 *
 * If the request fails, the promise will return null, unless the rejects option is set to true, in which case it will throw an error.
 *
 * @param opts.rejects Whether the promise should reject on an error. By default, it returns null and does not throw the error.
 * @param opts.basePath Base path for the API. Defaults to '/api/auth'.
 * @returns A new CSRF token.
 */
export const getCsrfToken: GetAuthMethod<string> = async (opts) => {
	return getAuthMethod<string>('csrf', opts);
};
