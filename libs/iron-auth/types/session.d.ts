// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as IronSession from 'iron-session';

import type { ReplaceObjectValues } from './util';

declare module 'iron-session' {
	interface IronSessionData {
		user?: Session['user'];
	}
}

export type Session = {
	user?: {
		/*
		 * NOTE: Iron Auth suggests using integers for the user id by default. However, if one wishes to use a string, they could use module augmentation to change the type of the id field.
		 *
		 * Using either a string or an integer is fine. It does not affect the functionality of the library.
		 */
		id: number;
		username?: string | null;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
};

export type ValidSession = ReplaceObjectValues<
	Session,
	'user',
	{ user: NonNullable<Session['user']> }
>;
