import { afterAll, beforeAll, expect, suite, test } from 'vitest';
import type { IronAuthApiResponse, IronAuthConfig, ValidSession } from 'iron-auth/types';
import { ironAuthHandler } from 'iron-auth/edge';
import type { CsrfInfo, KyselyDb } from '@libs/test-utils';
import {
  AccountBasket,
  buildUrl,
  countKyselyTable,
  edgeErrorResponse,
  getCookieFromHeaderAsString,
  getJsonResp,
} from '@libs/test-utils';
import type { SigninResponse, SignupResponse } from 'iron-auth';
import { getCsrfToken, getIronAuthOptions, getKysely } from './helpers';

let db: KyselyDb;
let ironAuthOptions: IronAuthConfig;

beforeAll(async () => {
  ironAuthOptions = await getIronAuthOptions(true);
  db = getKysely();
});

afterAll(async () => {
  await db.destroy();
});

suite('edge runtime', () => {
  suite('iron auth handler', () => {
    const accounts: AccountBasket = new AccountBasket();
    let csrfInfo: CsrfInfo;

    beforeAll(async () => {
      csrfInfo = await getCsrfToken();
    });

    test('no response object still works + check get no session', async () => {
      const req = new Request(buildUrl('session'), {
        method: 'GET',
        headers: {},
        body: null,
      });

      const res = await ironAuthHandler(ironAuthOptions, req, undefined, {});

      const data = await getJsonResp<IronAuthApiResponse<'error', ValidSession>>(res);

      expect(data).toEqual(edgeErrorResponse('NO_SESSION', 'Session not found'));
    });

    test('login fails with invalid account', async () => {
      const { email, password } = accounts.get('primary');

      const req = new Request(
        buildUrl('signin', { type: 'credentials', providerId: 'email-pass-provider' }),
        {
          method: 'POST',
          headers: {
            cookie: csrfInfo.cookie,
          },
          body: JSON.stringify({
            ...csrfInfo.body,
            email,
            password,
          }),
        },
      );

      const res = await ironAuthHandler(ironAuthOptions, req, undefined, {});

      const data = await getJsonResp<IronAuthApiResponse<'error', SigninResponse>>(res);

      expect(res.status).toEqual(401);
      expect(data).toEqual(edgeErrorResponse('UNAUTHORIZED', 'Invalid credentials'));
    });

    test('signup succeeds', async () => {
      const { email, password } = accounts.get('primary');

      const req = new Request(
        buildUrl('signup', { type: 'credentials', providerId: 'email-pass-provider' }),
        {
          method: 'POST',
          headers: {
            cookie: csrfInfo.cookie,
          },
          body: JSON.stringify({
            ...csrfInfo.body,
            email,
            password,
          }),
        },
      );

      const res = await ironAuthHandler(ironAuthOptions, req, undefined, {});

      const data = await getJsonResp<IronAuthApiResponse<'success', SignupResponse>>(res);

      expect(res.status).toEqual(200);
      expect(data.code).toEqual('OK');
      expect(data.data.email).toEqual(email);
      expect(data.data.id.toString().length).toBeGreaterThan(0);

      await expect(countKyselyTable(db, 'users')).resolves.toEqual(1);
      await expect(countKyselyTable(db, 'accounts')).resolves.toEqual(1);

      accounts.update('primary', { cookie: getCookieFromHeaderAsString(res) });
    });

    test('signup fails with existing email', async () => {
      const { email } = accounts.get('primary');
      const { password: secondaryPassword } = accounts.get('secondary');

      const req = new Request(
        buildUrl('signup', { type: 'credentials', providerId: 'email-pass-provider' }),
        {
          method: 'POST',
          headers: {
            cookie: csrfInfo.cookie,
          },
          body: JSON.stringify({
            ...csrfInfo.body,
            email,
            password: secondaryPassword,
          }),
        },
      );

      const res = await ironAuthHandler(ironAuthOptions, req, undefined, {});

      const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

      expect(res.status).toEqual(400);
      expect(data.code).toEqual('BAD_REQUEST');
      expect(data.error).toEqual('Account already exists');

      await expect(countKyselyTable(db, 'users')).resolves.toEqual(1);
      await expect(countKyselyTable(db, 'accounts')).resolves.toEqual(1);
    });

    test('signin succeeds with valid credentials', async () => {
      const { email, password } = accounts.get('primary');

      const req = new Request(
        buildUrl('signin', { type: 'credentials', providerId: 'email-pass-provider' }),
        {
          method: 'POST',
          headers: {
            cookie: csrfInfo.cookie,
          },
          body: JSON.stringify({
            ...csrfInfo.body,
            email,
            password,
          }),
        },
      );

      const res = await ironAuthHandler(
        { ...ironAuthOptions, redirects: { signIn: undefined } },
        req,
        undefined,
        {},
      );

      const data = await getJsonResp<IronAuthApiResponse<'success', SigninResponse>>(res);

      const cookie = getCookieFromHeaderAsString(res);

      expect(res.status).toEqual(200);
      expect(data.code).toEqual('OK');
      expect(data.success).toEqual(true);
      expect(data.data.email).toEqual(email);
      expect(data.data.id.toString().length).toBeGreaterThan(0);

      expect(cookie.length).toBeGreaterThan(0);
      accounts.update('primary', { cookie });

      await expect(countKyselyTable(db, 'users')).resolves.toEqual(1);
      await expect(countKyselyTable(db, 'accounts')).resolves.toEqual(1);
    });

    test('session exists with correct session cookie', async () => {
      const { email } = accounts.get('primary');

      const req = new Request(buildUrl('session'), {
        method: 'GET',
        headers: {
          cookie: accounts.get('primary').cookie as string,
        },
      });

      const res = await ironAuthHandler(ironAuthOptions, req, undefined, {});

      const data = await getJsonResp<IronAuthApiResponse<'success', ValidSession>>(res);

      expect(res.status).toEqual(200);
      expect(data.code).toEqual('OK');
      expect(data.success).toEqual(true);
      expect(data.data.user.email).toEqual(email);
      expect(data.data.user.id).toEqual(expect.any(Number));

      await expect(countKyselyTable(db, 'users')).resolves.toEqual(1);
      await expect(countKyselyTable(db, 'accounts')).resolves.toEqual(1);
    });
  });
});
