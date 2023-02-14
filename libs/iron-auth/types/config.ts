import type { CookieSerializeOptions } from 'cookie';
import type { IronAuthError, SigninResponse, SignoutResponse, SignupResponse } from '../src';
import type { InternalRequest } from './http';
import type { Session } from './session';

type UserId = NonNullable<Session['user']>['id'];

type IronPassword = string | { [id: string]: string };

type AccountWithUserResponse = {
  id: string;
  userId: UserId;

  type: string;
  provider: string;
  providerAccountId: string;
  providerAccountData: string | null;

  user: {
    id: UserId;
    username: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

/**
 * The types of providers.
 */
export type ProviderType = 'credentials' | 'oauth';

type ProviderIdentifier = { type: string; id: string };

/**
 * A generic configuration implemented by all adapters.
 */
export type GenericAdapterConfig = {
  /**
   * The function called to create a new user and account in the database.
   *
   * @returns Information about the newly created or linked account.
   */
  create: (account: {
    userId?: UserId;

    type: ProviderType;
    providerId: string;
    accountId: string;
    accountData?: string | null;

    username?: string;
    name?: string;
    image?: string;
    email?: string;
  }) => Promise<AccountWithUserResponse>;

  /**
   * The function called to find an account in the database.
   *
   * @returns The account information, along with information for the user that the account belongs to.
   */
  findAccount: (account: {
    userId?: UserId;

    type: ProviderType;
    providerId: string;
    accountId: string;
    accountData?: string | null;
  }) => Promise<AccountWithUserResponse | null>;
};

/**
 * A generic configuration implemented by all providers.
 */
export type GenericProviderConfig = {
  /**
   * The unique ID for the provider.
   */
  id: string;
  /**
   * The type of the provider.
   */
  type: ProviderType;
  /**
   * A precheck function that can validate the user's input before a provider decides to continue with the authentication flow.
   *
   * For example, checking that a user's credentials fit the required format.
   */
  precheck: <T>(req: InternalRequest) => T;
};

/**
 * Configuration options for Iron Auth.
 */
export type IronAuthConfig = {
  /**
   * Whether debug mode is enabled or not. When enabled, errors will be logged to the console.
   *
   * @default false
   */
  debug?: boolean;

  /**
   * Database adapter to use for user account data.
   *
   * This is required for storing user and account information in the database.
   */
  adapter: GenericAdapterConfig;
  /**
   * Activated authentication providers.
   *
   * These are required for authentication flows to work. Without a provider, there is nothing to sign up or sign in with.
   */
  providers: GenericProviderConfig[];

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
   * Iron Session options.
   */
  iron?: {
    /**
     * This is the cookie name that will be used inside the browser. You should make sure it's unique given
     * your application. Example: vercel-session
     *
     * @default iron-auth.session
     */
    cookieName?: string;
    /**
     * This is the password(s) that will be used to encrypt the cookie. It can be either a string or an object
     * like {1: "password", 2: password}.
     *
     * When you provide multiple passwords then all of them will be used to decrypt the cookie and only the most
     * recent (= highest key, 2 in this example) password will be used to encrypt the cookie. This allow you
     * to use password rotation (security)
     *
     * @default process.env.IRON_AUTH_IRON_PASSWORD
     * @default env.IRON_AUTH_IRON_PASSWORD (edge: from env var passed to handler)
     */
    password?: IronPassword;
    /**
     * This is the time in seconds that the session will be valid for. This also set the max-age attribute of
     * the cookie automatically (minus 60 seconds so that the cookie always expire before the session).
     *
     * @default 7 * 24 * 60 * 60 (7 days)
     */
    ttl?: number;
    /**
     * This is the options that will be passed to the cookie library.
     * You can see all of them here: https://github.com/jshttp/cookie#options-1.
     *
     * If you want to use "session cookies" (cookies that are deleted when the browser is closed) then you need
     * to pass cookieOptions: { maxAge: undefined }.
     */
    cookieOptions?: CookieSerializeOptions;
  };

  /**
   * Secret used for password encryption.
   *
   * An encryption secret is required when using the credentials provider.
   *
   * @default process.env.IRON_AUTH_ENCRYPTION_SECRET
   * @default env.IRON_AUTH_ENCRYPTION_SECRET (edge: env var passed to handler)
   */
  encryptionSecret?: string;

  /**
   * Secret used for generating a hash of the CSRF token.
   *
   * A CSRF secret is required.
   *
   * @default process.env.IRON_AUTH_CSRF_SECRET
   * @default env.IRON_AUTH_CSRF_SECRET (edge: env var passed to handler)
   */
  csrfSecret?: string;

  /**
   * Cookie options for the CSRF token cookie.
   *
   * @default
   */
  csrfOptions?: {
    /**
     * @default iron-auth.csrf
     */
    name?: string;
    /**
     * @default true
     */
    httpOnly?: boolean;
    /**
     * @default 'lax'
     */
    sameSite?: 'lax' | 'strict' | 'none';
    /**
     * @default '/'
     */
    path?: string;
    /**
     * @default true
     */
    secure?: boolean;
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
    signIn?: string | ((data: SigninResponse) => string);
    /**
     * Redirect URL for when the sign up route succeeds.
     *
     * For functions, the response data is passed through.
     *
     * @note It is NOT possible to set or modify cookies/headers when redirecting.
     *
     */
    signUp?: string | ((data: SignupResponse) => string);
    /**
     * Redirect URL for when the sign out route succeeds.
     *
     * For functions, the response data is passed through.
     *
     * @note It is NOT possible to set or modify cookies/headers when redirecting.
     *
     */
    signOut?: string | ((data: SignoutResponse) => string);
    /**
     * Redirect URL for when the link account route succeeds.
     *
     * For functions, the response data is passed through.
     *
     * @note It is NOT possible to set or modify cookies/headers when redirecting.
     */
    linkAccount?: string | ((data: SignoutResponse) => string);
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

  adapter: GenericAdapterConfig;
  providers: GenericProviderConfig[];

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

  iron: {
    cookieName: string;
    password: IronPassword;
    ttl: number;
    cookieOptions?: CookieSerializeOptions;
  };

  encryptionSecret?: string;
  csrfSecret: string;

  csrfOptions: {
    name: string;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: string;
    secure: boolean;
  };
} & Pick<IronAuthConfig, 'redirects'>;
