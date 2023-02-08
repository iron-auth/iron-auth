import type { IronSession } from 'iron-session';
import type { IncomingResponse, InternalRequest, ParsedIronAuthConfig } from '../../types';
import { IronAuthError } from '../helpers';
import { RequestRouter } from './request-router';
import { routes } from './routes';

const router = new RequestRouter(routes);

export const requestHandler = async (
  config: ParsedIronAuthConfig,
  req: InternalRequest,
  res: IncomingResponse,
  session: IronSession,
) => {
  const routePath = RequestRouter.getRouteName(req.query);

  switch (req.method) {
    case 'GET':
    case 'POST': {
      const routeSet = router.getRouteSet(req.method);
      const routeObj = RequestRouter.getRouteFromSet(routeSet, routePath);

      if (routeSet.before) {
        await routeSet.before(config, req);
      }

      const data = await routeObj.handler({ req, res, config, session });

      if (data) {
        return routeObj.callback(data, res);
      }
      break;
    }
    default: {
      throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid request method' });
    }
  }

  throw new IronAuthError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' });
};
