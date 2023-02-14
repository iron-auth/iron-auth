import { IronAuthError, IronAuthResponse } from 'iron-auth';
import type { codeToStatus } from 'iron-auth/src/utils/iron-auth-error';

export const edgeErrorResponse = (code: keyof typeof codeToStatus, message: string) =>
  IronAuthResponse.parseError(new IronAuthError({ code, message })).body;
