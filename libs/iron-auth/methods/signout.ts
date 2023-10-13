import type { SignOutResponse } from '../src/routes';
import { EventChannel } from './event-channel';
import type { PostAuthMethod } from './post-auth-method';
import { postAuthMethod } from './post-auth-method';

/**
 * Sign a user out and destroy the session.
 *
 * If the request fails, the promise will return null, unless the rejects option is set to true, in which case it will throw an error.
 *
 * @param opts.rejects Whether the promise should reject on an error. By default, it returns null and does not throw the error.
 * @param opts.basePath Base path for the API. Defaults to '/api/auth'.
 * @returns A boolean indicating whether the session was destroyed and the user was signed out.
 */
export const signOut: PostAuthMethod<SignOutResponse, true> = async (...args) => {
	const resp = await postAuthMethod<SignOutResponse, true>('signout', args);

	if (resp) {
		EventChannel.notify({ event: 'sign-out' });
	}

	return resp;
};
