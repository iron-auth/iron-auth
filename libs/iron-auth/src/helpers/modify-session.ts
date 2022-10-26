import type { IronSession } from 'iron-session';
import type { Session } from '../../types';
import { IronAuthError } from './iron-auth-error';

type Props<Override extends boolean> = {
  override?: Override;
};

export const modifySession = async <Override extends boolean>(
  session: IronSession,
  data: Override extends true ? Session['user'] : Partial<Session['user']>,
  { override }: Props<Override>,
): Promise<Session> => {
  if (session && session.user) {
    // eslint-disable-next-line no-param-reassign
    session.user = override ? (data as Session['user']) : { ...session.user, ...data };
    await session.save();

    return session;
  }

  throw new IronAuthError({ code: 'NO_SESSION', message: 'Session not found' });
};

export type { Props as ModifySessionProps };
