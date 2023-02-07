import type { IronSession } from 'iron-session';
import type { IncomingResponse, InternalRequest, ParsedIronAuthConfig } from '../../types';
import { IronAuthError, IronAuthResponse, verifyCsrfTokenForReq } from '../helpers';
import { csrfRoute, sessionRoute, signinRoute, signoutRoute, signupRoute } from '../routes';
import { linkAccountRoute } from '../routes/link-account';

export const requestHandler = async (
  config: ParsedIronAuthConfig,
  req: InternalRequest,
  res: IncomingResponse,
  session: IronSession,
) => {
  const { ironauth } = req.query;

  const routes = Array.isArray(ironauth) ? ironauth : [ironauth];

  if (!routes[0]) {
    throw new IronAuthError({ code: 'CONFIG_ERROR', message: '`ironauth` not found' });
  }

  if (routes[0] === 'ironauth') {
    routes.shift();
  }

  const [route] = routes;

  if (req.method === 'POST') {
    if (!(await verifyCsrfTokenForReq(req, config))) {
      throw new IronAuthError({ code: 'INVALID_CSRF_TOKEN', message: 'Invalid CSRF token' });
    }

    switch (route?.toLowerCase()) {
      case 'signup': {
        const data = await signupRoute(req, config, session);

        if (data) {
          return new IronAuthResponse({ code: 'OK', data, res, route: 'signUp' });
        }
        break;
      }
      case 'signin': {
        const data = await signinRoute(req, config, session);

        if (data) {
          return new IronAuthResponse({ code: 'OK', data, res, route: 'signIn' });
        }
        break;
      }
      case 'signout': {
        const data = await signoutRoute(session);

        if (data) {
          return new IronAuthResponse({ code: 'OK', data: true, res, route: 'signOut' });
        }
        break;
      }
      case 'linkaccount': {
        const data = await linkAccountRoute(req, config, session);

        if (data) {
          return new IronAuthResponse({ code: 'OK', data, res, route: 'linkAccount' });
        }
        break;
      }
      default: {
        throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid path' });
      }
    }
  } else if (req.method === 'GET') {
    switch (route?.toLowerCase()) {
      case 'session': {
        const data = await sessionRoute(session);

        if (data) {
          return new IronAuthResponse({ code: 'OK', data, res });
        }
        break;
      }
      case 'csrf': {
        const data = await csrfRoute(req, res, config);

        if (data) {
          return new IronAuthResponse({ code: 'OK', data, res });
        }
        break;
      }
      default: {
        throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid path' });
      }
    }
  }

  throw new IronAuthError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' });
};
