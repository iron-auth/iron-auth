import { credentialsProvider } from '@iron-auth/core';
import type { IronAuthConfig, IronAuthApiResponse } from '@iron-auth/core/types';
import { ironAuthHandler } from '@iron-auth/next';
import { prismaAdapter } from '@iron-auth/prisma-adapter';
import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { MockResponse, RequestOptions, ResponseOptions } from 'node-mocks-http';
import { createMocks } from 'node-mocks-http';
import { createPrismaClient } from 'prisma-mock-vitest';

type ApiRequest = NextApiRequest & ReturnType<typeof createMocks>['req'];
type ApiResponse = NextApiResponse & ReturnType<typeof createMocks>['res'];

export const getHttpMock = (reqOptions: RequestOptions = {}, resOptions: ResponseOptions = {}) => {
  const { req, res } = createMocks<ApiRequest, ApiResponse>(reqOptions, resOptions);

  return { req, res };
};

export const getJsonResp = <T extends object>(res: ApiResponse) =>
  // eslint-disable-next-line no-underscore-dangle
  res._getJSONData() as T;

const ironAuthOptions = (prisma: PrismaClient): IronAuthConfig => ({
  debug: false,
  iron: {
    cookieName: 'iron-auth.session',
    password: '53cF#DPPWcAbFnu726J!$9@s4$%wGnxyS^z307SOW@8AQO9xu&',
  },
  adapter: prismaAdapter(prisma),
  providers: [credentialsProvider, { ...credentialsProvider, id: 'email-pass-provider-alt' }],
  encryptionSecret: 'Random dev secret',
  csrfSecret: 'Random dev csrf secret',
  redirects: {
    signIn: '/account',
  },
  restrictedMethods: {
    signIn: [{ type: 'credentials', id: 'email-pass-provider' }],
    linkAccount: [{ type: 'credentials', id: 'email-pass-provider-alt' }],
  },
});

let opts: IronAuthConfig | undefined;
let prisma: PrismaClient;
export const getIronAuthOptions = async () => {
  if (!opts || !prisma) {
    prisma = await createPrismaClient<PrismaClient>({}, Prisma.dmmf.datamodel);
    opts = ironAuthOptions(prisma);
  }

  return opts;
};
export const getPrisma = () => prisma;

export const resetPrisma = async () => {
  if (prisma) {
    const models = Object.keys(prisma).filter((k) => !k.startsWith('_'));
    // @ts-expect-error - They are valid keys.
    await Promise.all(models.map((m) => prisma[m].deleteMany()));
  }
};

export const cookieFromHeader = (res: MockResponse<ApiResponse>) => {
  let cookie: Record<string, string> | null = null;

  const rawCookie = res.getHeader('Set-Cookie');

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

export const getCookieFromHeaderAsString = (res: MockResponse<ApiResponse>) => {
  const cookie = cookieFromHeader(res);

  return cookie
    ? Object.entries(cookie)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')
    : '';
};

export const getCsrfToken = async (): Promise<CsrfInfo> => {
  const { req, res } = getHttpMock({
    method: 'GET',
    query: {
      ironauth: 'csrf',
    },
  });

  await ironAuthHandler(await getIronAuthOptions(), req, res);

  const resp = getJsonResp<IronAuthApiResponse<'success', string>>(res);

  const rawToken = Array.isArray(res.getHeader('set-cookie'))
    ? ((res.getHeader('set-cookie') as string[])
        .find((cookie) => cookie.includes('iron-auth.csrf'))
        ?.split(';')[0]
        ?.split('=')[1] as string)
    : (res.getHeader('set-cookie') as string);

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
