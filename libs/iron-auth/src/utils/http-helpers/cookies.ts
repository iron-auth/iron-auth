import type { IncomingRequest, IncomingResponse, InternalRequest } from '../../../types';
import type { CookieOptions, InternalCookieOptions } from '../../../types/config';

const upFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const setCookie = (
	res: IncomingResponse,
	{ name, value }: { name: string; value: string },
	{ httpOnly = true, path = '/', sameSite = 'lax', secure = true, maxAge }: CookieOptions = {},
) => {
	const cookieName = secure && path === '/' ? `__Host-${name}` : name;

	let newCookie = `${cookieName}=${value}; Path=${path}; SameSite=${upFirst(sameSite)}`;

	if (secure) newCookie += '; Secure';
	if (httpOnly) newCookie += '; HttpOnly';
	if (maxAge) newCookie += `; Max-Age=${maxAge}`;

	if ('headers' in res) {
		res.headers.append('Set-Cookie', newCookie);
	} else {
		const existingCookie = res.getHeader('Set-Cookie') || '';
		const existingCookieArr = Array.isArray(existingCookie)
			? existingCookie
			: [existingCookie as string];

		res.setHeader('Set-Cookie', [...existingCookieArr, newCookie]);
	}

	return value;
};

export const getCookie = (req: InternalRequest, key: string, securePrefix?: boolean) => {
	const { cookies } = req;

	const cookieName = securePrefix ? `__Host-${key}` : key;

	return cookies[cookieName];
};

export const hasSecurePrefix = (cookieOptions?: InternalCookieOptions) =>
	(cookieOptions?.secure ?? true) && (cookieOptions?.path ?? '/') === '/';

export const refineCookies = (req: IncomingRequest): Partial<{ [key: string]: string }> => {
	let cookies = 'cookies' in req && req.cookies && !('getAll' in req.cookies) && req.cookies;

	if (!cookies) {
		const nom =
			typeof req.headers.get === 'function'
				? req.headers.get('cookie')
				: 'cookie' in req.headers && req.headers.cookie;

		if (nom) {
			cookies = nom.split(';').reduce(
				(prev, acc) => {
					const [key, value] = acc.split('=');
					return key && value ? { ...prev, [key]: value } : prev;
				},
				{} as Record<string, string>,
			);
		}
	}

	return cookies || {};
};
