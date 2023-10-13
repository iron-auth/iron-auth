import { IronAuthError } from 'iron-auth';
import { parseConfig, verifyCsrfToken, verifyCsrfTokenForReq } from 'iron-auth/src/utils';
import type {
	IronAuthApiResponse,
	InternalRequest,
	ParsedIronAuthConfig,
	IronAuthConfig,
} from 'iron-auth/types';
import { ironAuthHandler } from 'iron-auth/node';
import { suite, test, expect, beforeAll } from 'vitest';
import { getHttpMock, getJsonResp } from '@libs/test-utils';
import { getIronAuthOptions, resetPrisma } from './helpers';

suite('CSRF Token', () => {
	let csrfCookie: string;
	let ironAuthOptions: IronAuthConfig;
	let parsedIronAuthOptions: ParsedIronAuthConfig;

	beforeAll(async () => {
		await resetPrisma();
		ironAuthOptions = await getIronAuthOptions();
		parsedIronAuthOptions = parseConfig(ironAuthOptions);
	});

	test('CSRF route returns a token', async () => {
		const { req } = getHttpMock({
			method: 'GET',
			query: {
				ironauth: ['csrf'],
			},
		});

		console.log(req.query);

		const res = await ironAuthHandler(req, ironAuthOptions);

		const data = await getJsonResp<IronAuthApiResponse<'success', string>>(res);

		const rawToken = res.headers
			.get('Set-Cookie')
			?.split(',')
			.find((cookie) => cookie.includes('iron-auth.csrf'))
			?.split(';')[0]
			?.split('=')[1] as string;

		expect(res.status).toEqual(200);
		expect(data.code).toEqual('OK');
		expect(data.success).toEqual(true);
		expect(data.data.length).toBeGreaterThan(0);
		expect(rawToken.length).toBeGreaterThan(0);
		expect(rawToken.includes('_')).toEqual(true);

		csrfCookie = rawToken;
	});

	test('Missing CSRF cookie in req fails', async () => {
		const internalReq: InternalRequest = {
			method: 'POST',
			cookies: {},
			body: {},
		} as Partial<InternalRequest> as InternalRequest;

		await expect(verifyCsrfTokenForReq(internalReq, parsedIronAuthOptions)).rejects.toThrowError(
			new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' }),
		);
	});

	test('Missing CSRF token in req body fails', async () => {
		const internalReq: InternalRequest = {
			method: 'POST',
			cookies: {
				'__Host-iron-auth.csrf': csrfCookie,
			},
			body: {},
		} as Partial<InternalRequest> as InternalRequest;

		await expect(verifyCsrfTokenForReq(internalReq, parsedIronAuthOptions)).rejects.toThrowError(
			new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' }),
		);
	});

	test('Invalid CSRF token in req fails', async () => {
		const internalReq: InternalRequest = {
			method: 'POST',
			cookies: {
				'__Host-iron-auth.csrf': csrfCookie,
			},
			body: {
				csrfToken: 'Invalid token',
			},
		} as Partial<InternalRequest> as InternalRequest;

		await expect(verifyCsrfTokenForReq(internalReq, parsedIronAuthOptions)).rejects.toThrowError(
			new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' }),
		);
	});

	test('Valid CSRF token in req succeeds', async () => {
		const internalReq: InternalRequest = {
			method: 'POST',
			cookies: {
				'iron-auth.csrf': csrfCookie,
			},
			body: {
				csrfToken: csrfCookie.split('_')[0],
			},
		} as Partial<InternalRequest> as InternalRequest;

		const valid = await verifyCsrfTokenForReq(internalReq, parsedIronAuthOptions);

		expect(valid).toEqual(true);
	});

	test('Valid CSRF token matches', async () => {
		const [token] = csrfCookie.split('_');

		const matches = await verifyCsrfToken(csrfCookie, token as string, parsedIronAuthOptions);

		expect(matches).toEqual(true);
	});

	test('Invalid CSRF cookie does not match', async () => {
		const [token, hash] = csrfCookie.split('_');

		const matches = await verifyCsrfToken(
			`Invalid token_${hash}`,
			token as string,
			parsedIronAuthOptions,
		);

		const matchesAlt = await verifyCsrfToken(
			undefined as unknown as string,
			token as string,
			parsedIronAuthOptions,
		);

		const matchesAlt2 = await verifyCsrfToken(
			undefined as unknown as string,
			undefined as unknown as string,
			parsedIronAuthOptions,
		);

		expect(matches).toEqual(false);
		expect(matchesAlt).toEqual(false);
		expect(matchesAlt2).toEqual(false);
	});

	test('Invalid CSRF token does not match', async () => {
		const matches = await verifyCsrfToken(csrfCookie, 'Invalid token', parsedIronAuthOptions);
		const matchesAlt = await verifyCsrfToken(csrfCookie, '', parsedIronAuthOptions);
		const matchesAlt2 = await verifyCsrfToken(
			csrfCookie,
			null as unknown as string,
			parsedIronAuthOptions,
		);
		const matchesAlt3 = await verifyCsrfToken(
			csrfCookie,
			undefined as unknown as string,
			parsedIronAuthOptions,
		);
		const matchesAlt4 = await verifyCsrfToken(
			csrfCookie,
			123 as unknown as string,
			parsedIronAuthOptions,
		);
		const matchesAlt5 = await verifyCsrfToken(
			csrfCookie,
			{} as unknown as string,
			parsedIronAuthOptions,
		);

		expect(matches).toEqual(false);
		expect(matchesAlt).toEqual(false);
		expect(matchesAlt2).toEqual(false);
		expect(matchesAlt3).toEqual(false);
		expect(matchesAlt4).toEqual(false);
		expect(matchesAlt5).toEqual(false);
	});
});
