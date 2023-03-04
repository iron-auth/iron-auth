import type { InternalRequest } from '../../../types';
import { IronAuthError } from '../iron-auth-error';

export const getRouteName = (query: InternalRequest['query']) => {
  const { ironauth } = query;

  const routes = Array.isArray(ironauth) ? ironauth : [ironauth];

  console.log(query, routes);

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
