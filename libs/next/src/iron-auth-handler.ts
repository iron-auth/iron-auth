import { requestHandler } from 'iron-auth/src/handlers';
import {
  IronAuthError,
  IronAuthResponse,
  jsonFromReq,
  parseConfig,
  processCallback,
} from 'iron-auth/src/utils';
import { getCrypto } from 'iron-auth/src/utils/encryption';
import type { EdgeResponse, InternalRequest, IronAuthConfig } from 'iron-auth/types';
import { getIronSession } from 'iron-session';
import type { NextApiRequest, NextApiResponse } from 'next';

export const ironAuthHandler = async (
  config: IronAuthConfig,
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  getCrypto(require('crypto').webcrypto);

  const parsedConfig = parseConfig(config, process.env);

  try {
    const internalReq: InternalRequest = {
      url: req.url,
      path: req.query['ironauth'],
      method: req.method ?? 'GET',
      headers: req.headers,
      query: req.query,
      body: await jsonFromReq(req),
      cookies: req.cookies,
    };

    const session = await getIronSession(internalReq as unknown as Request, res, parsedConfig.iron);

    const resp = processCallback({
      config: parsedConfig,
      resp: await requestHandler(
        parsedConfig,
        internalReq,
        res as unknown as EdgeResponse,
        session,
      ),
    });

    if (resp.redirect) {
      const { url, status } = resp.redirect;

      res.redirect(status, url);
    }

    if (resp.err) {
      throw resp.err;
    }

    res.status(resp.status).json(resp.toJson());
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

      res.redirect(status, url);
    }

    const { status, body } = IronAuthResponse.parseError(resp.err);

    if (config.debug && body.code !== 'NO_SESSION') {
      console.error(err);
    }

    res.status(status).json(body);
  }
};
