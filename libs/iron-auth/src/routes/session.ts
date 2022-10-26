import type { IronSession } from 'iron-session';
import { getServerSideSession } from '../helpers';

export const sessionRoute = async (session: IronSession) => {
  return getServerSideSession(session);
};
