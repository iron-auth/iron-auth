import type { IronAuthResponse } from './iron-auth-response';
import { formatResponse, statusToCode } from './iron-auth-response';

export const toActualResponse = (internalRes: Response, response: IronAuthResponse) => {
  const status = statusToCode(response.code);
  const body = JSON.stringify(formatResponse(response));
  const headers = new Headers(internalRes.headers);

  headers.set('Content-Type', 'application/json;charset=UTF-8');
  if (response.redirect) {
    headers.set('Location', response.redirect);
  }

  return new Response(body, {
    status,
    headers,
  });
};
