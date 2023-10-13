import type { IronSession } from 'iron-session';
import { IronAuthError } from '../../utils';

export const signoutRoute = async (session: IronSession) => {
	if (session?.user) {
		session.destroy();
		return { data: true };
	}

	throw new IronAuthError({ code: 'NO_SESSION', message: 'Session not found' });
};

export type SignOutResponse = boolean;
