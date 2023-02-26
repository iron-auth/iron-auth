// import { IncomingMessage, ServerResponse } from 'http';
import type { getIronSession } from 'iron-session/edge';
import type {
  EdgeRequest,
  EdgeResponse,
  IncomingRequest,
  InternalRequest,
  IronAuthConfig,
  NonEdgeResponse,
} from '../../types';
import {
  fromCookieString,
  fromEntries,
  IronAuthError,
  IronAuthResponse,
  jsonFromReq,
  parseConfig,
  processCallback,
} from '../utils';
import { requestHandler } from './request-handler';

export type Handler = (...args: Parameters<typeof createHandler>) => unknown;

type ResolveResType<Req extends IncomingRequest> = Req extends EdgeRequest
  ? undefined
  : NonEdgeResponse;

type ResolveReturnType<Req extends IncomingRequest> = Req extends EdgeRequest
  ? EdgeResponse
  : never;

type HandlerReturnType<Req extends IncomingRequest> = ResolveReturnType<Req>;

const handleRedirect = <Req extends IncomingRequest, Res extends ResolveResType<Req>>(
  _req: Req,
  res: Res,
  { url, status }: { url: string; status: number },
): ResolveReturnType<Req> => {
  if (res) {
    res.redirect(status, url);
    return undefined as never;
  }

  return Response.redirect(url, status) as ResolveReturnType<Req>;
};

const handleResponse = <Req extends IncomingRequest, Res extends ResolveResType<Req>>(
  _req: Req,
  res: Res,
  {
    status,
    body,
    headers,
  }: { status: number; body: unknown; headers?: () => HeadersInit | undefined },
): ResolveReturnType<Req> => {
  if (res) {
    res.status(status).json(body);
    return undefined as never;
  }

  const respHeaders = new Headers(headers?.());
  respHeaders.set('Content-Type', 'application/json;charset=UTF-8');

  return new Response(JSON.stringify(body), {
    status,
    headers: respHeaders,
  }) as ResolveReturnType<Req>;
};

const checkErrorType = (err: unknown): IronAuthError =>
  err instanceof IronAuthError
    ? err
    : new IronAuthError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });

export type EdgeHandler = (
  config: IronAuthConfig,
  req: EdgeRequest,
  env?: Record<string, string | undefined>,
) => Promise<HandlerReturnType<EdgeRequest>>;

export const createHandler = (_getIronSession: typeof getIronSession) => {
  return async <Req extends IncomingRequest, Res extends ResolveResType<Req>>(
    config: IronAuthConfig,
    req: Req,
    res: Res,
    env?: Record<string, string | undefined>,
  ): Promise<HandlerReturnType<Req>> => {
    const parsedConfig = parseConfig(config, env);

    try {
      let path =
        ('params' in req && req.params?.['ironauth']) ||
        ('query' in req && req.query?.['ironauth']);
      let queryParams = ('params' in req && req.params) || ('query' in req && req.query) || {};
      let cookies = 'cookies' in req && req.cookies && !('getAll' in req.cookies) && req.cookies;

      if (!path) {
        path = req.url?.split('?')[0]?.split('/').pop() ?? '';
      }

      if (!Object.keys(queryParams ?? {}).length) {
        queryParams = fromEntries([
          ...((req.url?.includes('?') && new URL(req.url).searchParams?.entries()) || []),
          ['ironauth', path],
        ]);
      }

      if (!cookies) {
        const nom =
          typeof req.headers.get === 'function'
            ? req.headers.get('cookie')
            : 'cookie' in req.headers && req.headers.cookie;

        cookies = fromCookieString(nom || '');
      }

      const internalReq: InternalRequest = {
        url: req.url,
        path,
        method: req.method ?? 'GET',

        query: queryParams,
        body: await jsonFromReq(req),
        cookies: cookies || {},

        ...('credentials' in req
          ? { headers: req.headers, credentials: req.credentials }
          : { headers: req.headers }),
      };

      if (!('credentials' in req) && !res) {
        throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Missing response object' });
      }

      const internalRes = res ?? new Response();

      const session = await _getIronSession(
        internalReq as unknown as Request,
        internalRes,
        parsedConfig.iron,
      );

      const resp = processCallback({
        config: parsedConfig,
        resp: await requestHandler(parsedConfig, internalReq, internalRes, session),
      });

      if (resp.redirect) {
        return handleRedirect(req, res, resp.redirect);
      }

      if (resp.err) {
        throw resp.err;
      }

      const respHeaders: () => Headers | undefined = () => {
        if (resp.res && 'headers' in resp.res) {
          return resp.res.headers;
        }
        if (resp.res && 'getHeaders' in resp.res) {
          const tempHeaders = new Headers();

          // eslint-disable-next-line no-restricted-syntax
          for (const [key, value] of Object.entries(resp.res.getHeaders())) {
            if (Array.isArray(value) && value.length > 0) {
              value.forEach((item) => tempHeaders?.append(key, item));
            } else if (tempHeaders.has(key)) {
              tempHeaders.append(key, `${value}`);
            } else {
              tempHeaders.set(key, `${value}`);
            }
          }

          return tempHeaders;
        }

        return undefined;
      };

      return handleResponse(req, res, {
        status: resp.status,
        body: resp.toJson(),
        headers: respHeaders,
      });
    } catch (err) {
      const resp = processCallback({ config: parsedConfig, err: checkErrorType(err) });

      if (resp.redirect) {
        return handleRedirect(req, res, resp.redirect);
      }

      const { status, body } = IronAuthResponse.parseError(resp.err);

      if (config.debug && body.code !== 'NO_SESSION') {
        console.error(err);
      }

      return handleResponse(req, res, { status, body });
    }
  };
};
