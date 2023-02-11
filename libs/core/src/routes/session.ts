import type { IronSession } from 'iron-session';
import { isValidSession } from '../helpers';

export const sessionRoute = async (session: IronSession) => isValidSession(session);
