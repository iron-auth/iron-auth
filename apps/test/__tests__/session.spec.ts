import type { SignupResponse } from 'iron-auth';
import { IronAuthError } from 'iron-auth';
import { ironAuthHandler, modifySession } from 'iron-auth/next';
import type { IronAuthApiResponse } from 'iron-auth/types';
import type { IronSession } from 'iron-session';
import { suite, test, expect, vi, beforeAll } from 'vitest';
import type { CsrfInfo } from './helpers';
import {
  getCookieFromHeaderAsString,
  getCsrfToken,
  getHttpMock,
  getJsonResp,
  ironAuthOptions,
} from './helpers';

suite('Request handler treats request correctly', () => {
  let csrfInfo: CsrfInfo;
  let cookie: string;

  beforeAll(async () => {
    vi.clearAllMocks();

    csrfInfo = await getCsrfToken();
  });

  test('No session throws error', async () => {
    const { req, res } = getHttpMock({
      method: 'GET',
      query: {
        ironauth: ['session'],
      },
    });

    await ironAuthHandler(ironAuthOptions, req, res);

    const data = getJsonResp<IronAuthApiResponse<'error'>>(res);

    expect(res.statusCode).toEqual(401);
    expect(data.code).toEqual('NO_SESSION');
    expect(data.error).toEqual('Session not found');
  });

  test('Session exists and returns session data', async () => {
    let { req, res } = getHttpMock({
      method: 'POST',
      query: {
        ironauth: ['signup'],
        type: 'credentials',
        providerId: 'email-pass-provider',
      },
      cookies: { ...csrfInfo.cookies },
      body: { ...csrfInfo.body, email: 'test-email@ixionlabs.com', password: 'Password_123' },
    });

    await ironAuthHandler(ironAuthOptions, req, res);

    const data = getJsonResp<IronAuthApiResponse<'success', SignupResponse>>(res);

    expect(res.statusCode).toEqual(200);
    expect(data.data.email).toEqual('test-email@ixionlabs.com');
    expect(data.data.id.length).toBeGreaterThan(0);

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
    res = newMocks.res;

    await ironAuthHandler(ironAuthOptions, req, res);

    const session = getJsonResp<IronAuthApiResponse<'success', IronSession>>(res);

    expect(res.statusCode).toEqual(200);
    expect(session.code).toEqual('OK');
    expect((session.data.user?.id ?? '').toString().length).toBeGreaterThan(0);
  });

  test('Modify session throws error with no session', async () => {
    const { req, res } = getHttpMock({
      method: 'GET',
      query: {
        ironauth: ['session'],
      },
    });

    try {
      await modifySession(req, res, ironAuthOptions, { email: 'updated email' });
    } catch (e) {
      expect(e).toBeInstanceOf(IronAuthError);
      expect((e as IronAuthError).message).toEqual('Session not found');
    }
  });

  test('Modify session modifies the session data', async () => {
    let { req, res } = getHttpMock({
      method: 'GET',
      query: {
        ironauth: ['session'],
      },
      headers: {
        cookie,
      },
    });

    await modifySession(req, res, ironAuthOptions, { email: 'updated email' });

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
    res = newMocks.res;

    await ironAuthHandler(ironAuthOptions, req, res);

    const resp = getJsonResp<IronAuthApiResponse<'success', IronSession>>(res);
    console.log(resp);
    expect(res.statusCode).toEqual(200);
    expect(resp.code).toEqual('OK');
    expect(resp.data.user?.email).toEqual('updated email');
    expect((resp.data.user?.id ?? '').toString().length).toBeGreaterThan(0);
  });
});
