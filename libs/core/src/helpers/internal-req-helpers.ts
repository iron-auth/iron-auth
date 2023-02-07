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

    if ('body' in req && typeof req.body === 'string') {
      return JSON.parse(req.body);
    }

    return typeof req.body === 'object' ? req.body : {};
  } catch (e) {
    return {};
  }
};
