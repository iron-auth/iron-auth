import type { InternalRequest, ParsedIronAuthConfig } from '../../../types';
import { IronAuthError } from '../iron-auth-error';

export const assertSecret = (config: ParsedIronAuthConfig) => {
	if (!config.secrets.encryption) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: No encryption secret provided');
		throw new IronAuthError({
			code: 'CONFIG_ERROR',
			message: 'Invaild config',
		});
	}

	return config.secrets.encryption;
};

export const assertProvider = (
	req: InternalRequest,
	config: ParsedIronAuthConfig,
	route?: 'signIn' | 'signUp' | 'linkAccount',
) => {
	const { type, providerId } = req.query;

	const provider = config.providers.find((p) => p.id === providerId && p.type === type);

	if (!provider || typeof type !== 'string' || typeof providerId !== 'string') {
		throw new IronAuthError({
			code: 'BAD_REQUEST',
			message: 'Invalid provider',
		});
	}

	// check provider is allowed for route
	if (route) {
		// disallow using disabled methods
		if (config.disabledMethods[route] === true) {
			throw new IronAuthError({
				code: 'BAD_REQUEST',
				message: 'This method is disabled',
			});
		}

		// disallow using providers that are not enabled for the route
		if (
			Array.isArray(config.restrictedMethods[route]) &&
			!config.restrictedMethods[route]?.find((p) => p.type === type && p.id === providerId)
		) {
			throw new IronAuthError({
				code: 'BAD_REQUEST',
				message: 'Provider not allowed for this method',
			});
		}

		// validate base provider config
		if (!provider.id || !provider.type || !provider.name) {
			// eslint-disable-next-line no-console
			console.error('Iron Auth: Provider config is missing required info');
			throw new IronAuthError({
				code: 'CONFIG_ERROR',
				message: 'Invaild config',
			});
		}

		// validate credentials config
		if (provider.type === 'credentials') {
			if (!provider.precheck) {
				// eslint-disable-next-line no-console
				console.error('Iron Auth: Provider config is missing `precheck` function');
				throw new IronAuthError({
					code: 'CONFIG_ERROR',
					message: 'Invaild config',
				});
			}
		}

		// validate shared oauth / oidc config options
		if (provider.type === 'oauth' || provider.type === 'oidc') {
			if (!provider.options?.clientId || !provider.options?.clientSecret) {
				// eslint-disable-next-line no-console
				console.error('Iron Auth: Provider config is missing client options');
				throw new IronAuthError({
					code: 'CONFIG_ERROR',
					message: 'Invaild config',
				});
			}

			// validate oauth config
			if (provider.type === 'oauth') {
				if (!provider.authorization?.url || !provider.authorization?.scope) {
					// eslint-disable-next-line no-console
					console.error('Iron Auth: Provider config is missing `authorization` info');
					throw new IronAuthError({
						code: 'CONFIG_ERROR',
						message: 'Invaild config',
					});
				}

				if (!provider.token?.url) {
					// eslint-disable-next-line no-console
					console.error('Iron Auth: Provider config is missing `token` info');
					throw new IronAuthError({
						code: 'CONFIG_ERROR',
						message: 'Invaild config',
					});
				}

				if (!provider.userInfo?.url || !provider.userInfo?.parse) {
					// eslint-disable-next-line no-console
					console.error('Iron Auth: Provider config is missing `userInfo` info');
					throw new IronAuthError({
						code: 'CONFIG_ERROR',
						message: 'Invaild config',
					});
				}

				// validate oidc config
			} else if (provider.type === 'oidc') {
				if (!provider.discovery?.url) {
					// eslint-disable-next-line no-console
					console.error('Iron Auth: Provider config is missing `discovery` info');
					throw new IronAuthError({
						code: 'CONFIG_ERROR',
						message: 'Invaild config',
					});
				}

				if (!provider.authorization?.scope) {
					// eslint-disable-next-line no-console
					console.error('Iron Auth: Provider config is missing `authorization` info');
					throw new IronAuthError({
						code: 'CONFIG_ERROR',
						message: 'Invaild config',
					});
				}

				if (!provider.userInfo?.parse) {
					// eslint-disable-next-line no-console
					console.error('Iron Auth: Provider config is missing `userInfo` info');
					throw new IronAuthError({
						code: 'CONFIG_ERROR',
						message: 'Invaild config',
					});
				}
			}
		}
	}

	return provider;
};
