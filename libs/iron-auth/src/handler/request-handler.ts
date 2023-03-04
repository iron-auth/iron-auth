import type { IronSession } from 'iron-session';
import type { InternalRequest, ParsedIronAuthConfig } from '../../types';
import type { RouteHandler } from '../routes';
import { constructRouteResponse, routesGET, routesPOST } from '../routes';
import type { IronAuthResponse } from '../utils';
import { getRouteName, IronAuthError, validateCsrfToken } from '../utils';

export const requestHandler = async (
  req: InternalRequest,
  res: Response,
  config: ParsedIronAuthConfig,
  session: IronSession,
): Promise<IronAuthResponse> => {
  const routePath = getRouteName(req.query);

  let routeHandler: RouteHandler | undefined;

  // find the route handler to verify it is a valid route.
  if (req.method === 'GET') {
    routeHandler = routesGET[routePath as keyof typeof routesGET];
  } else if (req.method === 'POST') {
    routeHandler = routesPOST[routePath as keyof typeof routesPOST];
  } else {
    // we don't support any other request methods
    throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid request method' });
  }

  // if the route handler wasn't found in the routes list, the path is not valid
  if (!routeHandler) {
    throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid path' });
  }

  // run pre-checks for the request method.
  if (req.method === 'GET') {
    // nothing to validate or check on `GET` requests
  } else if (req.method === 'POST') {
    // check that there is a valid csrf token for post requests
    await validateCsrfToken(config, req);
  }

  const response = await routeHandler({ req, res, config, session });

  return constructRouteResponse(
    routePath as Exclude<IronAuthResponse['routeName'], 'unknown'>,
    response,
  );
};
