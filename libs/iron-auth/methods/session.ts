import type { ValidSession } from '../types';
import { EventChannel } from './event-channel';
import type { GetAuthMethod } from './get-auth-method';
import { getAuthMethod } from './get-auth-method';

type ExtraOpts = { notifyOnSuccess?: boolean };

/**
 * Fetch a user's session.
 *
 * If the request fails, the promise will return null, unless the rejects option is set to true, in which case it will throw an error.
 *
 * @param opts.rejects Whether the promise should reject on an error. By default, it returns null and does not throw the error.
 * @param opts.basePath Base path for the API. Defaults to '/api/auth'.
 * @returns The user's session, or null if no response was received.
 */
export const getSession: GetAuthMethod<ValidSession, ExtraOpts> = async (opts) => {
	const resp = await getAuthMethod<ValidSession, ExtraOpts>('session', opts);

	if (opts?.notifyOnSuccess && resp) {
		EventChannel.notify({ event: 'session-updated', userId: resp.user.id });
	}

	return resp;
};
