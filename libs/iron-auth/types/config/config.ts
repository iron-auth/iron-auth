import type { IronAuthError, SignInResponse, SignOutResponse, SignUpResponse } from '../../src';
import type { AdapterConfig } from './adapter';
import type { ProviderConfig, ProviderIdentifier } from './provider';

type IronPassword = string | { [id: string]: string };

/** Configuration options for Iron Auth. */
export type IronAuthConfig = {
	/**
	 * Whether debug mode is enabled or not. When enabled, errors will be logged to the console.
	 *
	 * @default false
	 */
	debug?: boolean;
	/**
	 * The URL for your website.
	 *
	 * @example 'https://ironauth.dev/api/auth'
	 *
	 * @default env.IRON_AUTH_URL
	 */
	url?: string;

	/**
	 * Database adapter to use for user account data.
	 *
	 * This is required for storing user and account information in the database.
	 */
	adapter: AdapterConfig;
	/**
	 * Activated authentication providers.
	 *
	 * These are required for authentication flows to work. Without a provider, there is nothing to sign up or sign in with.
	 */
	providers: ProviderConfig[];

	/**
	 * Link accounts when a user tries to sign up while they have a valid session.
	 *
	 * @note This option refers to linking accounts when a user tries to sign up while already logged in. It does not affect the usage of the linkAccount authentication method.
	 *
	 * @default true
	 */
	accountLinkingOnSignup?: boolean;

	/**
	 * Only permit certain providers to be used for certain auth methods/actions.
	 *
	 * For instance, if you want to restrict signing up to a specific credentials provider, you would include the ID of that provider in the `signUp` array.
	 *
	 * No methods are reistricted by default.
	 *
	 * @example
	 * restrictedMethods: {
	 *    // Sign up will only work with the `credentials` provider with ID `email-pass-provider`.
	 *    signUp: [{ type: 'credentials', id: 'email-pass-provider' }],
	 * }
	 */
	restrictedMethods?: {
		/**
		 * Restrict signing in to certain providers.
		 *
		 * @default undefined
		 */
		signIn?: ProviderIdentifier[];
		/**
		 * Restrict signing up to certain providers.
		 *
		 * @default undefined
		 */
		signUp?: ProviderIdentifier[];
		/**
		 * Restrict linking accounts to certain providers.
		 *
		 * @note This method is different to disabling the option `accountLinkingOnSignup`.
		 *
		 * @default undefined
		 */
		linkAccount?: ProviderIdentifier[];
	};

	/**
	 * Disable specific authentication methods.
	 *
	 * All methods are enabled by default.
	 */
	disabledMethods?: {
		/**
		 * Disable signing in.
		 *
		 * @default false
		 */
		signIn?: boolean;
		/**
		 * Disable signing up.
		 *
		 * @default false
		 */
		signUp?: boolean;
		/**
		 * Disable linking accounts.
		 *
		 * @note This method is different to disabling the option `accountLinkingOnSignup`.
		 *
		 * @default false
		 */
		linkAccount?: boolean;
	};

	/**
	 * The secrets used in Iron Auth for encrypting cookies and generating CSRF tokens.
	 *
	 * By default, they are read from environment variables.
	 */
	secrets?: {
		/**
		 * This is the password(s) that will be used to encrypt the cookie. It can be either a string or an object
		 * like {1: "password", 2: password}.
		 *
		 * When you provide multiple passwords then all of them will be used to decrypt the cookie and only the most
		 * recent (= highest key, 2 in this example) password will be used to encrypt the cookie. This allow you
		 * to use password rotation (security)
		 *
		 * @default env.IRON_AUTH_IRON_PASSWORD
		 */
		ironPassword?: IronPassword;
		/**
		 * Secret used for encryption in the database.
		 *
		 * An encryption secret is required when using the credentials provider.
		 *
		 * @default env.IRON_AUTH_ENCRYPTION_SECRET
		 */
		encryption?: string;
		/**
		 * Secret used for generating a hash of the CSRF token.
		 *
		 * A CSRF secret is required.
		 *
		 * @default env.IRON_AUTH_CSRF_SECRET
		 */
		csrf?: string;
		/**
		 * Secret used for encrypting cookies used in the OAuth flow.
		 *
		 * An OAuth secret is required.
		 *
		 * @default env.IRON_AUTH_OAUTH_SECRET
		 */
		oauth?: IronPassword;
	};

	/**
	 * Options for the cookies used by Iron Auth.
	 */
	cookies?: {
		/**
		 * Options for the Iron Session cookie.
		 */
		session?: Omit<CookieOptions, 'maxAge'> & {
			/**
			 * @link https://tools.ietf.org/html/rfc6265#section-5.3
			 * @default 7 * 24 * 60 * 60 (7 days)
			 */
			maxAge?: number;
		};
		/**
		 * Options for the CSRF token cookie.
		 */
		csrf?: CookieOptions;
		/**
		 * Options for the OAuth PKCE cookie.
		 */
		pkce?: CookieOptions;
		/**
		 * Options for the OAuth state cookie.
		 */
		state?: CookieOptions;
		/**
		 * Options for the OAuth nonce cookie.
		 */
		nonce?: CookieOptions;
	};

	/**
	 * Define redirect URLs for providers.
	 *
	 * @note It is NOT possible to set cookies/headers when redirecting.
	 *
	 * Either strings or functions may be provided. A function must return a string for the redirect to occur.
	 *
	 * If a function is provided, either the response data or the error will be passed, depending on the type of redirect.
	 *
	 * Redirects do not occur by default.
	 */
	redirects?: {
		/**
		 * Redirect URL for when the sign in route succeeds.
		 *
		 * For functions, the response data is passed through.
		 *
		 * @note It is NOT possible to set or modify cookies/headers when redirecting.
		 *
		 */
		signIn?: string | ((data: SignInResponse) => string);
		/**
		 * Redirect URL for when the sign up route succeeds.
		 *
		 * For functions, the response data is passed through.
		 *
		 * @note It is NOT possible to set or modify cookies/headers when redirecting.
		 *
		 */
		signUp?: string | ((data: SignUpResponse) => string);
		/**
		 * Redirect URL for when the sign out route succeeds.
		 *
		 * For functions, the response data is passed through.
		 *
		 * @note It is NOT possible to set or modify cookies/headers when redirecting.
		 *
		 */
		signOut?: string | ((data: SignOutResponse) => string);
		/**
		 * Redirect URL for when the link account route succeeds.
		 *
		 * For functions, the response data is passed through.
		 *
		 * @note It is NOT possible to set or modify cookies/headers when redirecting.
		 */
		linkAccount?: string | ((data: SignOutResponse) => string);
		/**
		 * Redirect for when an error occurs during the authentication flow.
		 *
		 * For functions, the error object is passed through.
		 *
		 * The redirect will have a query parameter with the error code and error message.
		 *
		 * e.g. /auth-error-page?error=UNAUTHORIZED&message=Invalid credentials
		 *
		 * @note It is NOT possible to set or modify cookies/headers when redirecting.
		 */
		error?: string | ((error: IronAuthError) => string);
	};
};

export type ParsedIronAuthConfig = {
	debug: boolean;
	url: string;

	adapter: AdapterConfig;
	providers: ProviderConfig[];

	accountLinkingOnSignup: boolean;

	restrictedMethods: {
		signIn: ProviderIdentifier[] | undefined;
		signUp: ProviderIdentifier[] | undefined;
		linkAccount: ProviderIdentifier[] | undefined;
	};
	disabledMethods: {
		signIn: boolean | undefined;
		signUp: boolean | undefined;
		linkAccount: boolean | undefined;
	};

	secrets: {
		ironPassword: IronPassword;
		encryption: string;
		csrf: string;
		oauth: IronPassword;
	};

	cookies: {
		session: InternalCookieOptions;
		csrf: InternalCookieOptions;
		pkce: InternalCookieOptions;
		state: InternalCookieOptions;
		nonce: InternalCookieOptions;
	};

	redirects?: {
		signin?: string | ((data: SignInResponse) => string);
		signup?: string | ((data: SignUpResponse) => string);
		signout?: string | ((data: SignOutResponse) => string);
		linkaccount?: string | ((data: SignOutResponse) => string);
		error?: string | ((error: IronAuthError) => string);
	};
};

export type InternalCookieOptions = {
	name: string;
	maxAge: number;
	httpOnly: boolean;
	sameSite: 'lax' | 'strict' | 'none';
	path: string;
	secure: boolean;
};

export type CookieOptions = {
	/**
	 * @default 'iron-auth.${type}'
	 */
	name?: string;
	/**
	 * @link https://tools.ietf.org/html/rfc6265#section-5.3
	 * @default 15 * 60 // (15 minutes)
	 */
	maxAge?: number;
	/**
	 * @link https://tools.ietf.org/html/rfc6265#section-5.2.6
	 * @default true
	 */
	httpOnly?: boolean;
	/**
	 * @link https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7
	 * @default 'lax'
	 */
	sameSite?: 'lax' | 'strict' | 'none';
	/**
	 * @link https://tools.ietf.org/html/rfc6265#section-5.2.4
	 * @default '/'
	 */
	path?: string;
	/**
	 * @link https://tools.ietf.org/html/rfc6265#section-5.2.5
	 * @default true
	 */
	secure?: boolean;
};
