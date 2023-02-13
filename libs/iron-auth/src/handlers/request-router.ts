import type { IronSession } from 'iron-session';
import type {
  ParsedIronAuthConfig,
  InternalRequest,
  IncomingResponse,
  ApiResponseDataType,
} from '../../types';
import { IronAuthError, IronAuthResponse } from '../utils';

type RouteCallback = <DataType extends ApiResponseDataType>(
  data: DataType,
  res: IncomingResponse,
) => IronAuthResponse<DataType>;

type RouteHandler = (args: {
  req: InternalRequest;
  res: IncomingResponse;
  config: ParsedIronAuthConfig;
  session: IronSession;
}) => Promise<ApiResponseDataType>;

type RouteSet<T extends string> = {
  before?: (config: ParsedIronAuthConfig, req: InternalRequest) => Promise<void>;
  routes: {
    [key in T]: {
      handler: RouteHandler;
      callback: RouteCallback;
    };
  };
};
export type Routes = Record<string, RouteSet<string>>;

type RouteRedirectName = keyof NonNullable<ParsedIronAuthConfig['redirects']>;

export const getCallback: RouteCallback = (data, res) =>
  new IronAuthResponse({ code: 'OK', data, res });

export const postCallback: (routeName: RouteRedirectName) => RouteCallback =
  (routeName: RouteRedirectName) => (data, res) =>
    new IronAuthResponse({ code: 'OK', data, res, route: routeName });

export class RequestRouter<R extends Routes> {
  private routes: R;

  constructor(routes: R) {
    this.routes = routes;
  }

  getRouteSet = <Method extends keyof R | undefined>(method: Method) => {
    if (!method) {
      throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid request method' });
    }

    const routeSet = this.routes[method];

    if (!routeSet) {
      throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid request method' });
    }

    return routeSet;
  };

  static getRouteFromSet = (routeSet: RouteSet<string>, routePath: string) => {
    const route = routeSet.routes[routePath as keyof typeof routeSet.routes];

    if (!route) {
      throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid path' });
    }

    return route;
  };

  static getRouteName = (query: InternalRequest['query']) => {
    const { ironauth } = query;

    const routes = Array.isArray(ironauth) ? ironauth : [ironauth];

    if (!routes[0]) {
      throw new IronAuthError({ code: 'CONFIG_ERROR', message: '`ironauth` not found' });
    } else if (routes[0] === 'ironauth') {
      routes.shift();
    }

    const [route] = routes;

    if (!route) {
      throw new IronAuthError({ code: 'NOT_FOUND', message: 'Invalid path' });
    }

    return route.toLowerCase();
  };
}
