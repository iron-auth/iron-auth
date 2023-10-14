import type { InternalRequest } from '../http';

/**
 * The types of providers.
 */
export type ProviderType = 'credentials' | 'oauth' | 'oidc';

export type ProviderIdentifier = { type: string; id: string };

/** A base configuration implemented by all providers. */
type BaseProviderConfig = {
	/** The unique ID for the provider. */
	id: string;
	/** The name of the provider. */
	name: string;
	/** The type of the provider. */
	type: ProviderType;
};

export type CredentialsPreCheckResponse = {
	/** The user's email address. */
	email: string;
	/** The user's raw password. */
	password: string;
};

export type CredentialsProviderConfig = BaseProviderConfig & {
	type: Extract<ProviderType, 'credentials'>;
	/**
	 * A precheck function that can validate the user's input before a provider decides to continue with the authentication flow.
	 *
	 * For example, checking that a user's credentials fit the required format.
	 */
	precheck: (req: InternalRequest) => CredentialsPreCheckResponse;
};

export type OAuthProviderOptions = {
	/** Client ID for the provider. */
	clientId: string;
	/** Client secret for the provider. */
	clientSecret: string;
};

export type OAuthUserInfo = {
	id: string;
	username: string | null;
	name: string | null;
	email: string | null;
	image: string | null;
};

type OAuthSpecific<TProfile extends Record<string, unknown>> = {
	type: Extract<ProviderType, 'oauth'>;
	/**
	 * The provider's authorization URL and scope.
	 *
	 * @example
	 * ```
	 * {
	 *   url: 'https://github.com/login/oauth/authorize',
	 *   scope: 'read:user user:email',
	 * }
	 * ```
	 */
	authorization: {
		/**
		 * Authorization URL.
		 *
		 * @example
		 * 'https://github.com/login/oauth/authorize'
		 */
		url: string;
		/**
		 * Scope to request from the provider.
		 *
		 * @example
		 * // Request read access to a GitHub user's profile data and their email addresses.
		 * 'read:user user:email'
		 */
		scope: string;
		/**
		 * Whether the provider supports PKCE.
		 *
		 * @default false
		 */
		supportsPKCE?: boolean;
	};
	/**
	 * The provider's token URL.
	 *
	 * @example
	 * ```
	 * {
	 *   url: 'https://github.com/login/oauth/access_token',
	 * }
	 * ```
	 */
	token: {
		/**
		 * Token URL.
		 *
		 * @example
		 * 'https://github.com/login/oauth/access_token'
		 */
		url: string;
	};
	/**
	 * The provider's user information URL and response transformer.
	 *
	 * @example
	 * ```
	 * {
	 *   url: 'https://api.github.com/user',
	 *   parse: (user) => ({
	 *     id: user.id.toString(),
	 *     username: user.login,
	 *     name: user.name ?? user.login,
	 *     email: user.email,
	 *     image: user.avatar_url,
	 *   }),
	 * }
	 * ```
	 */
	userInfo: {
		/**
		 * User information URL or API endpoint.
		 *
		 * @example
		 * 'https://api.github.com/user'
		 */
		url: string;
		/**
		 * A custom request function that can be used to retrieve the user's information from the provider.
		 *
		 * If specified, it is used instead of the standard implementation. This can be useful if the provider requires multiple API requests to retrieve the user's information.
		 *
		 * @param opts.accessToken THe access token retrieved from the provider.
		 * @param opts.userInfoUrl The user information URL or API endpoint for the provider.
		 *
		 * @returns The user's information from the provider.
		 */
		customRequest?: ({
			accessToken,
			userInfoUrl,
		}: {
			accessToken: string;
			userInfoUrl: string;
		}) => Promise<TProfile>;
		/**
		 * The function called after the user's information has been retrieved from the provider.
		 *
		 * It should return the data in a standard format and can be used to modify how the data is represented.
		 *
		 * @example
		 * ```
		 * (user) => ({
		 *   id: user.id.toString(),
		 *   username: user.login,
		 *   name: user.name ?? user.login,
		 *   email: user.email,
		 *   image: user.avatar_url,
		 * })
		 * ```
		 */
		parse: (userInfo: TProfile) => OAuthUserInfo;
	};
};

type OIDCSpecific<TProfile extends Record<string, unknown>> = {
	type: Extract<ProviderType, 'oidc'>;
	/** The provider's discovery URL. */
	discovery: {
		/** Discovery URL. */
		url: string;
	};
	/** The provider's authorization scope. */
	authorization: Pick<OAuthSpecific<TProfile>['authorization'], 'scope' | 'supportsPKCE'>;
	/** The provider's user information response transformer. */
	userInfo: Pick<OAuthSpecific<TProfile>['userInfo'], 'customRequest' | 'parse'>;
};

/** A base configuration implemented by all OAuth / OIDC providers. */
export type OAuthProviderConfig<
	TProfile extends Record<string, unknown> = Record<string, unknown>,
> = BaseProviderConfig & {
	/** Client ID and Client Secret for the provider. */
	options: OAuthProviderOptions;
} & (OAuthSpecific<TProfile> | OIDCSpecific<TProfile>);

export type OAuthProvider<TProfile extends Record<string, unknown> = Record<string, unknown>> = (
	options: OAuthProviderOptions,
) => OAuthProviderConfig<TProfile>;

export type ProviderConfig = CredentialsProviderConfig | OAuthProviderConfig;
