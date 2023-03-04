import type { IronSession } from 'iron-session';
import type { ApiResponseDataType, InternalRequest, ParsedIronAuthConfig } from '../../../types';

export type RouteResponse = { data: ApiResponseDataType; isRedirectUrl?: boolean };
export type RouteHandlerArgs = {
  req: InternalRequest;
  res: Response;
  config: ParsedIronAuthConfig;
  session: IronSession;
};

export type RouteHandler = (args: RouteHandlerArgs) => Promise<RouteResponse>;
export type Routes = Record<string, RouteHandler>;
