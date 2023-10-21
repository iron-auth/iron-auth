import { credentialsProvider } from 'iron-auth/providers';
import type { AdapterConfig, IronAuthConfig } from 'iron-auth/types';

import { apiUrl } from './constants';

export const ironAuthOptions = (adapter: AdapterConfig, debug = false): IronAuthConfig => ({
	debug,
	url: apiUrl,

	adapter,
	providers: [credentialsProvider, { ...credentialsProvider, id: 'email-pass-provider-alt' }],

	secrets: {
		ironPassword: '53cF#DPPWcAbFnu726J!$9@s4$%wGnxyS^z307SOW@8AQO9xu&',
		csrf: 'Random dev csrf secret',
		encryption: 'Random dev encryption secret',
		oauth: 'Random dev oauth secret',
	},

	cookies: {
		session: {
			name: `iron-auth.session`,
			maxAge: 7 * 24 * 60 * 60,
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			secure: false,
		},

		csrf: {
			name: `iron-auth.csrf`,
			maxAge: 15 * 60,
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			secure: false,
		},

		pkce: {
			name: `iron-auth.pkce`,
			maxAge: 15 * 60,
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			secure: false,
		},

		state: {
			name: `iron-auth.state`,
			maxAge: 15 * 60,
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			secure: false,
		},

		nonce: {
			name: `iron-auth.nonce`,
			maxAge: 15 * 60,
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			secure: false,
		},
	},

	redirects: {
		signIn: '/account',
	},
	restrictedMethods: {
		signIn: [{ type: 'credentials', id: 'email-pass-provider' }],
		linkAccount: [{ type: 'credentials', id: 'email-pass-provider-alt' }],
	},
});
