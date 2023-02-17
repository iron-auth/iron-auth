import { ServerResponse } from 'http';
import type { IronAuthApiResponse } from 'iron-auth/types';
import type { RequestOptions } from './fake-request';
import { FakeRequest } from './fake-request';
import { FakeResponse } from './fake-response';

export * from './fake-request';
export * from './fake-response';

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
  const res = new FakeResponse(req);

  return { req, res };
};

const getHeader = (res: FakeResponse | Response, key: string) =>
  res instanceof ServerResponse ? res.getHeader(key) : res.headers.get(key);

export const getJsonResp = async <T extends object>(res: FakeResponse | Response) =>
  // eslint-disable-next-line no-underscore-dangle
  (res instanceof ServerResponse ? res._getJSONData() : await res.json()) as T;

export const cookieFromHeader = (res: FakeResponse | Response) => {
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

export const getCookieFromHeaderAsString = (res: FakeResponse | Response) => {
  const cookie = cookieFromHeader(res);

  return cookie
    ? Object.entries(cookie)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')
    : '';
};

export const getCsrfToken = async (res: FakeResponse | Response): Promise<CsrfInfo> => {
  const resp = await getJsonResp<IronAuthApiResponse<'success', string>>(res);

  const rawToken = Array.isArray(getHeader(res, 'set-cookie'))
    ? ((getHeader(res, 'set-cookie') as string[])
        .find((cookie) => cookie.includes('iron-auth.csrf'))
        ?.split(';')[0]
        ?.split('=')[1] as string)
    : (getHeader(res, 'set-cookie') as string);

  const [token, hash] = rawToken.split('_');

  return {
    cookies: { '__Host-iron-auth.csrf': rawToken },
    body: { csrfToken: resp.data },
    cookie: rawToken,
    token: token as string,
    hash: hash as string,
  };
};

export type CsrfInfo = {
  cookies: Record<string, string>;
  body: Record<string, string>;
  cookie: string;
  token: string;
  hash: string;
};
