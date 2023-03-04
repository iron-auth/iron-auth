import type { IncomingRequest } from '../../../types';

export const refinePath = (req: IncomingRequest): string => {
  let path =
    ('params' in req && req.params?.['ironauth']) || ('query' in req && req.query?.['ironauth']);

  if (!path) {
    path = req.url?.split('?')[0]?.split('/').pop() ?? '';
  } else if (Array.isArray(path)) {
    path = [...path].pop() ?? '';
  }

  return path;
};
