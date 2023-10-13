import type { CsrfInfo } from '@libs/test-utils';
import { getHttpMock, getJsonResp } from '@libs/test-utils';
import { ironAuthHandler } from 'iron-auth/node';
import type { IronAuthApiResponse, IronAuthConfig } from 'iron-auth/types';
import { beforeAll, expect, suite, test, vi } from 'vitest';

import { getCsrfToken, getIronAuthOptions, resetPrisma } from './helpers';

suite('Request handler treats request correctly', () => {
	let ironAuthOptions: IronAuthConfig;
	let csrfInfo: CsrfInfo;

	beforeAll(async () => {
		vi.clearAllMocks();
		await resetPrisma();

		ironAuthOptions = await getIronAuthOptions();
		csrfInfo = await getCsrfToken();
	});

	test('No `ironauth` is handled', async () => {
		const { req } = getHttpMock();

		const res = await ironAuthHandler(req, ironAuthOptions);

		const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

		expect(res.status).toEqual(500);
		expect(data.code).toEqual('CONFIG_ERROR');
		expect(data.error).toEqual('`ironauth` not found');
	});

	test('No path is handled', async () => {
		const { req } = getHttpMock({
			method: 'POST',
			query: {
				ironauth: 'ironauth',
			},
			cookies: { ...csrfInfo.cookies },
			body: { ...csrfInfo.body },
		});

		const res = await ironAuthHandler(req, ironAuthOptions);

		const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

		expect(res.status).toEqual(404);
		expect(data.code).toEqual('NOT_FOUND');
		expect(data.error).toEqual('Invalid path');
	});

	test('Invalid path is handled', async () => {
		const { req } = getHttpMock({
			method: 'POST',
			query: {
				ironauth: 'invalidpath',
			},
			cookies: { ...csrfInfo.cookies },
			body: { ...csrfInfo.body },
		});

		const res = await ironAuthHandler(req, ironAuthOptions);

		const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

		expect(res.status).toEqual(404);
		expect(data.code).toEqual('NOT_FOUND');
		expect(data.error).toEqual('Invalid path');
	});

	test('Valid path with invalid additional query returns bad request', async () => {
		const { req } = getHttpMock({
			method: 'POST',
			query: {
				ironauth: 'signup',
			},
			cookies: { ...csrfInfo.cookies },
			body: { ...csrfInfo.body },
		});

		const res = await ironAuthHandler(req, ironAuthOptions);

		const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

		expect(res.status).toEqual(400);
		expect(data.code).toEqual('BAD_REQUEST');
		expect(data.error).toEqual('Invalid provider');
	});

	test('Valid path with provider not in config return bad request', async () => {
		const { req } = getHttpMock({
			method: 'POST',
			query: {
				ironauth: 'signup',
				type: 'credentials',
				providerId: 'invalid-provider-id',
			},
			cookies: { ...csrfInfo.cookies },
			body: { ...csrfInfo.body },
		});

		const res = await ironAuthHandler(req, ironAuthOptions);

		const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

		expect(res.status).toEqual(400);
		expect(data.code).toEqual('BAD_REQUEST');
		expect(data.error).toEqual('Invalid provider');
	});
});
