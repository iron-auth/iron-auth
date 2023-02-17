import type { IronAuthApiResponse, IronAuthConfig } from 'iron-auth/types';
import { ironAuthHandler } from 'iron-auth/node';
import { suite, test, expect, vi, beforeAll } from 'vitest';
import type { CsrfInfo } from '@libs/test-utils';
import { getHttpMock, getJsonResp } from '@libs/test-utils';
import { resetPrisma, getCsrfToken, getIronAuthOptions } from './helpers';

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
    const { req, res } = getHttpMock();

    await ironAuthHandler(ironAuthOptions, req, res);

    const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

    expect(res.statusCode).toEqual(500);
    expect(data.code).toEqual('CONFIG_ERROR');
    expect(data.error).toEqual('`ironauth` not found');
  });

  test('No path is handled', async () => {
    const { req, res } = getHttpMock({
      method: 'POST',
      query: {
        ironauth: 'ironauth',
      },
      cookies: { ...csrfInfo.cookies },
      body: { ...csrfInfo.body },
    });

    await ironAuthHandler(ironAuthOptions, req, res);

    const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

    expect(res.statusCode).toEqual(404);
    expect(data.code).toEqual('NOT_FOUND');
    expect(data.error).toEqual('Invalid path');
  });

  test('Invalid path is handled', async () => {
    const { req, res } = getHttpMock({
      method: 'POST',
      query: {
        ironauth: 'invalidpath',
      },
      cookies: { ...csrfInfo.cookies },
      body: { ...csrfInfo.body },
    });

    await ironAuthHandler(ironAuthOptions, req, res);

    const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

    expect(res.statusCode).toEqual(404);
    expect(data.code).toEqual('NOT_FOUND');
    expect(data.error).toEqual('Invalid path');
  });

  test('Valid path with invalid additional query returns bad request', async () => {
    const { req, res } = getHttpMock({
      method: 'POST',
      query: {
        ironauth: 'signup',
      },
      cookies: { ...csrfInfo.cookies },
      body: { ...csrfInfo.body },
    });

    await ironAuthHandler(ironAuthOptions, req, res);

    const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

    expect(res.statusCode).toEqual(400);
    expect(data.code).toEqual('BAD_REQUEST');
    expect(data.error).toEqual('Invalid provider');
  });

  test('Valid path with provider not in config return bad request', async () => {
    const { req, res } = getHttpMock({
      method: 'POST',
      query: {
        ironauth: 'signup',
        type: 'credentials',
        providerId: 'invalid-provider-id',
      },
      cookies: { ...csrfInfo.cookies },
      body: { ...csrfInfo.body },
    });

    await ironAuthHandler(ironAuthOptions, req, res);

    const data = await getJsonResp<IronAuthApiResponse<'error'>>(res);

    expect(res.statusCode).toEqual(400);
    expect(data.code).toEqual('BAD_REQUEST');
    expect(data.error).toEqual('Invalid provider');
  });
});
