import type { IronAuthApiResponse } from 'iron-auth/types';

import type { RequestOptions } from './fake-request';
import { FakeRequest } from './fake-request';
// import { FakeResponse } from './fake-response';

export * from './fake-request';
// export * from './fake-response';

export const buildUrl = (route: string, params?: Record<string, string>) =>
	`https://localhost:3000/api/auth/${route}${
		params ? `?${new URLSearchParams(params).toString()}` : ''
	}`;

export const getHttpMock = (reqOptions: RequestOptions = {}) => {
	const req = new FakeRequest({
		url: reqOptions.url,
		method: reqOptions.method,
		headers: reqOptions.headers ?? {},
		query: reqOptions.query,
		body: reqOptions.body,
		cookies: reqOptions.cookies ?? {},
	});
	// const res = new FakeResponse(req);

	return { req };
};

const getHeader = (res: Response, key: string) => res.headers.get(key);

export const getJsonResp = async <T extends object>(res: Response) => (await res.json()) as T;

export const cookieFromHeader = (res: Response) => {
	let cookie: Record<string, string> | null = null;

	const rawCookie = getHeader(res, 'Set-Cookie');

	if (typeof rawCookie !== 'number') {
		const cookieDetails = (Array.isArray(rawCookie) ? rawCookie[0] : rawCookie)?.split(';');
		if (cookieDetails && cookieDetails[0]) {
			const [cookieName, cookieValue] = cookieDetails[0].split('=');
			if (cookieName && cookieValue) {
				cookie = {};
				cookie[cookieName] = cookieValue;
			}
		}
	}

	return cookie;
};

export const getCookieFromHeaderAsString = (res: Response) => {
	const cookie = cookieFromHeader(res);

	return cookie
		? Object.entries(cookie)
				.map(([key, value]) => `${key}=${value}`)
				.join('; ')
		: '';
};

export const getCsrfToken = async (res: Response): Promise<CsrfInfo> => {
	const resp = await getJsonResp<IronAuthApiResponse<'success', string>>(res);

	const rawToken = Array.isArray(getHeader(res, 'Set-Cookie'))
		? (getHeader(res, 'Set-Cookie')
				?.split(',')
				?.find((cookie) => cookie.includes('iron-auth.csrf'))
				?.split(';')[0] as string)
		: (getHeader(res, 'Set-Cookie')?.split(';')[0] as string);

	const [token, hash] = rawToken.split('=')[1]?.split('_') as [string, string];

	const [cookieName, cookieValue] = rawToken.split('=') as [string, string];

	return {
		cookies: { [cookieName]: cookieValue },
		body: { csrfToken: resp.data },
		cookie: rawToken,
		token,
		hash,
	};
};

export type CsrfInfo = {
	cookies: Record<string, string>;
	body: Record<string, string>;
	cookie: string;
	token: string;
	hash: string;
};
