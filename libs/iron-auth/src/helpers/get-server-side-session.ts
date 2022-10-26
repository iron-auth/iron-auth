import type { IronSession } from 'iron-session';
import type { Session } from '../../types';
import { IronAuthError } from './iron-auth-error';

export const getServerSideSession = async (session: IronSession): Promise<Session> => {
  if (session && session.user) {
    return session;
  }

  throw new IronAuthError({ code: 'NO_SESSION', message: 'Session not found' });
};
