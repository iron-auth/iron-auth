import { ironAuthHandler } from 'iron-auth/node';
import { getHttpMock, getJsonResp } from '@libs/test-utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterAll, beforeAll, vi } from 'vitest';
import { getIronAuthOptions } from './request-utils';

const basePath = 'http://app.localhost';
const basePathApi = `${basePath}/api/auth`;

let cookieStore: Map<string, { value: string; expires?: Date }>;

beforeAll(() => {
	cookieStore = new Map<string, { value: string; expires?: Date }>();

	globalThis.fetch = vi.fn(async (url_, opts) => {
		if (!url_.toString().includes('/api/auth')) {
			throw new Error('Invalid Request URL');
		}

		const url = new URL(url_.toString());

		let route = url_.toString().split('?')[0]?.split('/').pop() ?? '';
		if (route === 'auth') route = '';

		const newParams: Partial<Record<string, string>> = {};
		// eslint-disable-next-line no-restricted-syntax
		for (const [key, value] of url.searchParams?.entries() ??
			new URLSearchParams(url.search).entries()) {
			newParams[key] = value;
		}
		if (route) newParams['ironauth'] = route;

		const gotCookies = [...cookieStore.entries()].reduce((acc, [name, { value, expires }]) => {
			if (expires && expires < new Date()) {
				cookieStore.delete(name);
				return acc;
			}

			const cookie = `${name}=${value};`;
			return acc ? `${acc}; ${cookie}` : cookie;
		}, '');

		// console.log('req', url.toString(), opts?.headers, newParams, gotCookies);

		const { req: reqMock } = getHttpMock({
			url: url.href,
			method: opts?.method ?? 'GET',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore - ok dud
			headers: {
				...opts?.headers,
				cookie: gotCookies,
				// cookie: req.headers.get('cookie')?.replace(', ', '; ') ?? '',
			},
			query: newParams,
			body: opts?.body,
			cookies: [...cookieStore.entries()].reduce(
				(acc, [name, { value }]) => {
					acc[name] = value;
					return acc;
				},
				{} as Record<string, string>,
			),
		});

		const res = await ironAuthHandler(reqMock, await getIronAuthOptions());

		res.headers
			.get('set-cookie')
			?.split(',')
			?.forEach((cookie) => {
				const [name, value] = cookie.split('=');
				if (name) {
					const [refinedValue, ...rest] = (value ?? '').split(';');
					const expires = rest.find((v) => v.includes('expires'));
					if (expires) {
						const [, date] = expires.split('=');
						cookieStore.set(name, { value: refinedValue ?? '', expires: new Date(date ?? '') });
					} else {
						cookieStore.set(name, { value: refinedValue ?? '', expires: undefined });
					}
				}
			});

		const newHeaders = res.headers;

		// eslint-disable-next-line no-underscore-dangle
		const redirectUrl = res.status === 302 ? newHeaders.get('location') : undefined;
		const jsonResp = (await getJsonResp(res)) ?? {};

		if (redirectUrl) {
			window.location.replace(redirectUrl);
		}

		return Promise.resolve(
			new Response(JSON.stringify(jsonResp ?? {}), {
				status: res.status,
				headers: redirectUrl
					? {
							'Content-Type': 'application/json;charset=UTF-8',
							Location: redirectUrl,
							...newHeaders,
					  }
					: { 'Content-Type': 'application/json;charset=UTF-8', ...newHeaders },
			}),
		);
	});
});

afterAll(() => {
	cookieStore.clear();
});

export { basePathApi as basePath };
