import type { SignUpResponse } from 'iron-auth';
import { IronAuthError } from 'iron-auth';
import type { IronAuthApiResponse, IronAuthConfig } from 'iron-auth/types';
import { ironAuthHandler, modifySession } from 'iron-auth/node';
import type { IronSession } from 'iron-session';
import { suite, test, expect, vi, beforeAll } from 'vitest';
import type { CsrfInfo } from '@libs/test-utils';
import {
  AccountBasket,
  getCookieFromHeaderAsString,
  getHttpMock,
  getJsonResp,
} from '@libs/test-utils';
import { resetPrisma, getCsrfToken, getIronAuthOptions } from './helpers';

suite('Request handler treats request correctly', () => {
  let ironAuthOptions: IronAuthConfig;
  let accounts: AccountBasket;
  let csrfInfo: CsrfInfo;
  let cookie: string;

  beforeAll(async () => {
    vi.clearAllMocks();
    await resetPrisma();

    ironAuthOptions = await getIronAuthOptions();
    csrfInfo = await getCsrfToken();
    accounts = new AccountBasket();
  });

  test('No session throws error', async () => {
    const { req } = getHttpMock({
      method: 'GET',
      query: {
        ironauth: ['session'],
      },
    });

    const res = await ironAuthHandler(req, ironAuthOptions);

    const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

    expect(res.status).toEqual(401);
    expect(data.code).toEqual('NO_SESSION');
    expect(data.error).toEqual('Session not found');
  });

  test('Session exists and returns session data', async () => {
    const { email, password } = accounts.get('primary');

    let { req } = getHttpMock({
      method: 'POST',
      query: {
        ironauth: ['signup'],
        type: 'credentials',
        providerId: 'email-pass-provider',
      },
      cookies: { ...csrfInfo.cookies },
      body: { ...csrfInfo.body, email, password },
    });

    let res = await ironAuthHandler(req, ironAuthOptions);

    const data = await getJsonResp<IronAuthApiResponse<'success', SignUpResponse>>(res);

    expect(res.status).toEqual(200);
    expect(data.data.email).toEqual(email);
    expect(data.data.id.toString().length).toBeGreaterThan(0);

    cookie = getCookieFromHeaderAsString(res);

    const newMocks = getHttpMock({
      method: 'GET',
      query: {
        ironauth: ['session'],
      },
      headers: {
        cookie,
      },
    });

    req = newMocks.req;

    res = await ironAuthHandler(req, ironAuthOptions);

    const session = await getJsonResp<IronAuthApiResponse<'success', IronSession>>(res);

    expect(res.status).toEqual(200);
    expect(session.code).toEqual('OK');
    expect((session.data.user?.id ?? '').toString().length).toBeGreaterThan(0);
  });

  test('Modify session throws error with no session', async () => {
    const { req } = getHttpMock({
      method: 'GET',
      query: {
        ironauth: ['session'],
      },
    });

    try {
      await modifySession(req, ironAuthOptions, { email: 'updated email' });
    } catch (e) {
      expect(e).toBeInstanceOf(IronAuthError);
      expect((e as IronAuthError).message).toEqual('Session not found');
    }
  });

  test('Modify session modifies the session data', async () => {
    let { req } = getHttpMock({
      method: 'GET',
      query: {
        ironauth: ['session'],
      },
      headers: {
        cookie,
      },
    });

    let res = await modifySession(req, ironAuthOptions, { email: 'updated email' });

    const newMocks = getHttpMock({
      method: 'GET',
      query: {
        ironauth: ['session'],
      },
      headers: {
        cookie: getCookieFromHeaderAsString(res),
      },
    });

    req = newMocks.req;

    res = await ironAuthHandler(req, ironAuthOptions);

    const resp = await getJsonResp<IronAuthApiResponse<'success', IronSession>>(res);

    expect(res.status).toEqual(200);
    expect(resp.code).toEqual('OK');
    expect(resp.data.user?.email).toEqual('updated email');
    expect((resp.data.user?.id ?? '').toString().length).toBeGreaterThan(0);
  });
});
