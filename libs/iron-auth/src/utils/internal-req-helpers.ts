import type { IncomingRequest } from '../../types';

export const fromEntries = (
  entries: [string, string | string[] | undefined][],
): Record<string, string | string[]> => {
  return entries.reduce((acc, [key, value]) => (value ? { ...acc, [key]: value } : acc), {});
};

export const fromCookieString = (cookies: string | null): Record<string, string> => {
  if (!cookies) return {};

  return cookies.split(';').reduce((prev, acc) => {
    const [key, value] = acc.split('=');
    return key && value ? { ...prev, [key]: value } : prev;
  }, {} as Record<string, string>);
};

export const jsonFromReq = async (req: IncomingRequest) => {
  try {
    if ('credentials' in req) {
      return await req.json();
    }

    if ('body' in req) {
      if (typeof req.body === 'object') return req.body;
      if (typeof req.body === 'string' && req.body.length > 0) return JSON.parse(req.body);
    }
  } catch (e) {
    // do nothing and just continue on to return {}
  }

  return {};
};
