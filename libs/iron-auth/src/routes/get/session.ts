import type { IronSession } from 'iron-session';
import { isValidSession } from '../../utils';

export const sessionRoute = async (session: IronSession) => ({ data: isValidSession(session) });
