import type { LinkAccountResponse } from '../src';
import type { PostAuthMethod } from './post-auth-method';
import { postAuthMethod } from './post-auth-method';

/**
 * Link a new account to an existing user account.
 *
 * For providers that require account information, like with credentials providers, the relevant information should also be provided to the data option.
 *
 * If the request fails, the promise will return null, unless the rejects option is set to true, in which case it will throw an error.
 *
 * @param type Type of authentication provider.
 * @param provider Authentication provider ID.
 * @param opts.data Optional data to send to the provider. This is useful for providers that require you to post the newly linked account's information to them, like credentials providers.
 * @param opts.rejects Whether the promise should reject on an error. By default, it returns null and does not throw the error.
 * @param opts.basePath Base path for the API. Defaults to '/api/auth'.
 * @returns The link account response from the provider, or null if no response was received.
 */
export const linkAccount: PostAuthMethod<LinkAccountResponse> = async (...args) =>
	postAuthMethod<LinkAccountResponse>('linkaccount', args);
