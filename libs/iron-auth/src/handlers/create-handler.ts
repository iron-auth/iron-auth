import { IncomingMessage, ServerResponse } from 'http';
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
  ? EdgeResponse | undefined
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
  if (res instanceof ServerResponse) {
    res.redirect(status, url);
    return undefined as never;
  }

  return Response.redirect(url, status) as ResolveReturnType<Req>;
};

const handleResponse = <Req extends IncomingRequest, Res extends ResolveResType<Req>>(
  _req: Req,
  res: Res,
  { status, body, headers }: { status: number; body: unknown; headers?: HeadersInit },
): ResolveReturnType<Req> => {
  if (res instanceof ServerResponse) {
    res.status(status).json(body);
    return undefined as never;
  }

  const respHeaders = new Headers(headers);
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

export const createHandler = (_getIronSession: typeof getIronSession) => {
  return async <Req extends IncomingRequest, Res extends ResolveResType<Req>>(
    config: IronAuthConfig,
    req: Req,
    res: Res,
    env?: Record<string, string | undefined>,
  ): Promise<HandlerReturnType<Req>> => {
    const parsedConfig = parseConfig(config, env);

    try {
      let path = 'query' in req ? req.query?.['ironauth'] : '';
      let queryParams = 'query' in req && req.query;
      let cookies = 'cookies' in req && req.cookies;

      if (req.url) {
        path = new URL(req.url).pathname.split('/').pop();
      }

      if (!queryParams) {
        queryParams = fromEntries([
          ...(new URL(req.url ?? 'http://localhost:3000').searchParams?.entries() ?? []),
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

        ...(req instanceof IncomingMessage
          ? { headers: req.headers }
          : { headers: req.headers, credentials: 'same-origin' }),
      };

      if (req instanceof IncomingMessage && !res) {
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

      return handleResponse(req, res, {
        status: resp.status,
        body: resp.toJson(),
        headers: resp.res && 'headers' in resp.res ? resp.res.headers : undefined,
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
