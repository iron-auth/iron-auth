import { getIronSession } from 'iron-session/edge';
import { requestHandler } from '../src/handlers';
import {
  fromCookieString,
  fromEntries,
  IronAuthError,
  IronAuthResponse,
  jsonFromReq,
  parseConfig,
  processCallback,
} from '../src/helpers';
import type { EdgeRequest, EdgeResponse, InternalRequest, IronAuthConfig } from '../types';

export const ironAuthHandler = async (
  config: IronAuthConfig,
  req: EdgeRequest,
  env?: Record<string, string | undefined>,
) => {
  const parsedConfig = parseConfig(config, env);

  try {
    const parsedUrl = new URL(req.url);
    const ironAuthValue = parsedUrl.pathname.split('/').pop();

    const queryParams = fromEntries([
      ...parsedUrl.searchParams.entries(),
      ['ironauth', ironAuthValue],
    ]);

    const cookies = fromCookieString(req.headers.get('cookie'));

    const internalReq: InternalRequest = {
      url: req.url,
      path: ironAuthValue ?? '',
      method: req.method ?? 'GET',
      headers: req.headers,
      query: queryParams,
      body: await jsonFromReq(req),
      cookies,
      credentials: 'same-origin',
    };

    const session = await getIronSession(
      internalReq as unknown as Request,
      new Response(),
      parsedConfig.iron,
    );

    const resp = processCallback({
      config: parsedConfig,
      resp: await requestHandler(parsedConfig, internalReq, new Response(), session),
    });

    if (resp.redirect) {
      const { url, status } = resp.redirect;

      Response.redirect(url, status);
    }

    const respHeaders = new Headers((resp.res as EdgeResponse | undefined)?.headers);
    respHeaders.set('Content-Type', 'application/json;charset=UTF-8');

    return new Response(resp.toString(), {
      status: resp.status,
      headers: respHeaders,
    });
  } catch (err) {
    const resp = processCallback({
      config: parsedConfig,
      err:
        err instanceof IronAuthError
          ? err
          : new IronAuthError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'An unexpected error occurred',
            }),
    });

    if (resp.redirect) {
      const { url, status } = resp.redirect;

      Response.redirect(url, status);
    }

    const { status, body } = IronAuthResponse.parseError(err);

    if (config.debug && body.code !== 'NO_SESSION') {
      console.error(err);
    }

    return new Response(JSON.stringify(body), {
      status,
      headers: new Headers({ 'Content-Type': 'application/json;charset=UTF-8' }),
    });
  }
};
