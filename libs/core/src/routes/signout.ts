import type { IronSession } from 'iron-session';
import { IronAuthError } from '../helpers';

export const signoutRoute = async (session: IronSession) => {
  if (session?.user) {
    session.destroy();
    return true;
  }

  throw new IronAuthError({ code: 'NO_SESSION', message: 'Session not found' });
};

export type SignoutResponse = boolean;
