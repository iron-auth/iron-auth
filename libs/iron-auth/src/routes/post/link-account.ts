import type { IronSession } from 'iron-session';

import type {
	CredentialsProviderConfig,
	InternalRequest,
	ParsedIronAuthConfig,
	ValidSession,
} from '../../../types';
import { assertProvider, assertSecret, encrypt, IronAuthError, isValidSession } from '../../utils';

export const linkAccountRoute = async (
	req: InternalRequest,
	config: ParsedIronAuthConfig,
	_session: IronSession,
) => {
	// check a user session exists
	const session = isValidSession(_session);
	// check the provider is enabled for this route
	const provider = assertProvider(req, config, 'linkAccount');

	let findAccountIdentifier: Parameters<typeof config.adapter.findAccount>[0];
	let createData: () => Promise<Parameters<typeof config.adapter.create>[0]>;

	switch (provider.type) {
		case 'credentials': {
			// get new credentials from request
			const { email, password } = (provider as CredentialsProviderConfig).precheck(req);

			findAccountIdentifier = {
				type: provider.type,
				providerId: provider.id,
				accountId: email,
			};

			createData = async () => ({
				...findAccountIdentifier,
				userId: session.user.id,
				accountData: (await encrypt(password, assertSecret(config))).combined,
				email,
			});
			break;
		}
		default: {
			throw new IronAuthError({
				code: 'BAD_REQUEST',
				message: 'Provider type not supported',
			});
		}
	}

	try {
		// check if account already exists with the new identifier
		const account = await config.adapter.findAccount(findAccountIdentifier);

		if (account) {
			throw new IronAuthError({ code: 'BAD_REQUEST', message: 'Account already exists' });
		}

		// create the new account
		const data = await config.adapter.create(await createData());

		if (data.user) {
			return { data: data.user };
		}
	} catch (error) {
		if (config.debug) {
			// eslint-disable-next-line no-console
			console.error('Error linking account:', error instanceof Error ? error.message : error);
		}

		// Re-throw if it's an IronAuthError, otherwise do nothing as generic error is thrown if nothing returns.
		if (error instanceof IronAuthError) {
			throw error;
		}
	}

	throw new IronAuthError({
		code: 'INTERNAL_SERVER_ERROR',
		message: 'Unexpected error linking account',
	});
};

export type LinkAccountResponse = {
	/**
	 * The user's unique ID in the database.
	 */
	id: ValidSession['user']['id'];
	/**
	 * The user's username.
	 */
	username: string | null;
	/**
	 * The user's name.
	 */
	name: string | null;
	/**
	 * The user's email address.
	 */
	email: string | null;
	/**
	 * The user's avatar image.
	 */
	image: string | null;
};
