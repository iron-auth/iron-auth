import { emailRegex, passwordRegex } from '../constants';
import { IronAuthError } from '../src';
import type { CredentialsProviderConfig, InternalRequest } from '../types';
import type { CredentialsPreCheckResponse } from '../types/config';

/**
 * A credentials provider for Iron Auth.
 *
 * It enables user authentication using both an email and password.
 *
 * The encrypted version of the password gets stored in the database when a user signs up. It is then compared to the encrypted version of the password provided by the user when they sign in.
 *
 * Passwords are required to contain at least 8 characters, 1 special character, 1 uppercase letter, 1 lowercase letter, and 1 number.
 */
export const credentialsProvider: CredentialsProviderConfig = {
	id: 'email-pass-provider',
	name: 'Credentials',
	type: 'credentials',
	precheck: <T = CredentialsPreCheckResponse>(req: InternalRequest) => {
		const { email, password } = req.body;

		if (typeof email !== 'string' || typeof password !== 'string') {
			throw new IronAuthError({ code: 'BAD_REQUEST', message: 'Invalid credentials' });
		} else if (!emailRegex.test(email)) {
			throw new IronAuthError({ code: 'BAD_REQUEST', message: 'Invalid email' });
		} else if (passwordRegex.test(password)) {
			throw new IronAuthError({ code: 'BAD_REQUEST', message: 'Invalid password' });
		}

		if (!email || !password) {
			throw new IronAuthError({
				code: 'BAD_REQUEST',
				message: 'Invalid credentials',
			});
		}

		return { email, password } as T;
	},
};
