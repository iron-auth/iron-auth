import type { IronSession } from 'iron-session';
import type { ValidSession } from '../../../types';
import { IronAuthError } from '../iron-auth-error';

export const isValidSession = (session: IronSession): ValidSession => {
  if (session && session.user && session.user.id) {
    return { ...session, user: session.user };
  }

  throw new IronAuthError({
    code: 'NO_SESSION',
    message: 'Session not found',
  });
};
