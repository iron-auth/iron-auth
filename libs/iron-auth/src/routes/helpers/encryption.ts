import { sealData, unsealData } from 'iron-session/edge';
import type { IncomingResponse, InternalRequest, ParsedIronAuthConfig } from '../../../types';
import type { InternalCookieOptions } from '../../../types/config';
import { getCookie, hasSecurePrefix, IronAuthError, setCookie } from '../../utils';

/**
 * Seal an OAuth cookie value and set it as a cookie.
 *
 * @param res Incoming response
 * @param config Parsed config
 * @param type Type of cookie
 * @param value Cookie value
 * @returns Cookie value
 */
export const sealOAuthCookie = async (
	res: IncomingResponse,
	config: ParsedIronAuthConfig,
	cookieOptions: InternalCookieOptions,
	value: string,
) => {
	const sealed = await sealData(value, {
		password: config.secrets.oauth,
		ttl: cookieOptions.maxAge,
	});

	return setCookie(res, { name: cookieOptions.name, value: sealed }, cookieOptions);
};

/**
 * Unseal an OAuth cookie and retrieve its value.
 *
 * @param req Incoming request
 * @param config Parsed config
 * @param type Type of cookie
 * @returns Cookie value
 */
export const unsealOAuthCookie = async (
	req: InternalRequest,
	config: ParsedIronAuthConfig,
	cookieOptions: InternalCookieOptions,
) => {
	const cookie = getCookie(req, cookieOptions.name, hasSecurePrefix(cookieOptions));
	if (!cookie) {
		throw new IronAuthError({
			code: 'INVALID_OAUTH_COOKIE',
			message: `Could not find the ${cookieOptions.name} cookie`,
		});
	}

	const unsealed = await unsealData<string>(cookie, {
		password: config.secrets.oauth,
		ttl: cookieOptions.maxAge,
	});

	return unsealed;
};
