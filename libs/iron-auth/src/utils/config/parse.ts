import type { IronAuthConfig, ParsedIronAuthConfig } from '../../../types';
import { IronAuthError } from '../iron-auth-error';

const withDefaultCookieOptions = (
	config: IronAuthConfig,
	type: keyof NonNullable<IronAuthConfig['cookies']>,
	fallbackMaxAge = 15 * 60,
) => ({
	name: config.cookies?.[type]?.name ?? `iron-auth.${type}`,
	maxAge: config.cookies?.[type]?.maxAge ?? fallbackMaxAge,
	httpOnly: config.cookies?.[type]?.httpOnly ?? true,
	sameSite: config.cookies?.[type]?.sameSite ?? 'lax',
	path: config.cookies?.[type]?.path ?? '/',
	secure: config.cookies?.[type]?.secure ?? true,
});

export const parseConfig = (
	config: IronAuthConfig,
	env?: Record<string, string | undefined>,
): ParsedIronAuthConfig => {
	if (!config.adapter) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: No adapter was provided.');
		throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
	} else if (!Array.isArray(config.providers) || config.providers.length === 0) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: No providers were provided.');
		throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
	}

	const ironPassword = (env && env['IRON_AUTH_IRON_PASSWORD']) || config.secrets?.ironPassword;
	const encryptionSecret =
		(env && env['IRON_AUTH_ENCRYPTION_SECRET']) || config.secrets?.encryption;
	const csrfSecret = (env && env['IRON_AUTH_CSRF_SECRET']) || config.secrets?.csrf;
	const oauthSecret = (env && env['IRON_AUTH_OAUTH_SECRET']) || config.secrets?.oauth;
	let ironUrl = (env && env['IRON_AUTH_URL']) || config.url;

	if (!ironPassword) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: No iron password was provided.');
		throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
	} else if (!encryptionSecret) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: No encryption secret was provided.');
		throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
	} else if (!csrfSecret) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: No csrf secret was provided.');
		throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
	} else if (!oauthSecret) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: No oauth secret was provided.');
		throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
	} else if (!ironUrl) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: No URL was provided.');
		throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
	} else if (!ironUrl.startsWith('http')) {
		// eslint-disable-next-line no-console
		console.error('Iron Auth: The URL must start with http or https.');
		throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
	} else if (ironUrl.endsWith('/')) {
		ironUrl = ironUrl.slice(0, -1);
	}

	const parsedConfig: ParsedIronAuthConfig = {
		debug: config.debug ?? false,
		url: ironUrl,

		adapter: config.adapter,
		providers: config.providers ?? [],

		accountLinkingOnSignup: config.accountLinkingOnSignup ?? true,

		restrictedMethods: {
			signIn: config.restrictedMethods?.signIn,
			signUp: config.restrictedMethods?.signUp,
			linkAccount: config.restrictedMethods?.linkAccount,
		},
		disabledMethods: {
			signIn: config.disabledMethods?.signIn,
			signUp: config.disabledMethods?.signUp,
			linkAccount: config.disabledMethods?.linkAccount,
		},

		secrets: {
			ironPassword,
			encryption: encryptionSecret,
			csrf: csrfSecret,
			oauth: oauthSecret,
		},

		cookies: {
			session: withDefaultCookieOptions(config, 'session', 7 * 24 * 60 * 60),
			csrf: withDefaultCookieOptions(config, 'csrf'),
			pkce: withDefaultCookieOptions(config, 'pkce'),
			state: withDefaultCookieOptions(config, 'state'),
			nonce: withDefaultCookieOptions(config, 'nonce'),
		},

		redirects: {
			signin: config.redirects?.signIn,
			signup: config.redirects?.signUp,
			signout: config.redirects?.signOut,
			linkaccount: config.redirects?.linkAccount,
			error: config.redirects?.error,
		},
	};

	return parsedConfig;
};
