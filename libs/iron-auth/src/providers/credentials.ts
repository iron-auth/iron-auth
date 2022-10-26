import type { GenericProviderConfig, InternalRequest } from '../../types';
import { IronAuthError } from '../helpers';

export type CredentialsProviderConfig = GenericProviderConfig & {
  type: 'credentials';
  precheck: <T = CredentialsPreCheckResponse>(req: InternalRequest) => T | null;
};

export type CredentialsPreCheckResponse = {
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's raw password.
   */
  password: string;
};

// Regex used in type=”email” input element.
const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/;
// If there is not at least: 8 characters, 1 special char, 1 uppercase, 1 lowercase, and 1 number.
const passwordRegex = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/;

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

    return { email, password } as T;
  },
};
