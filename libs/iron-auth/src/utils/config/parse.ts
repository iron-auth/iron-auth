import type { IronAuthConfig, ParsedIronAuthConfig } from '../../../types';
import { IronAuthError } from '../iron-auth-error';

export const parseConfig = (
  config: IronAuthConfig,
  env?: Record<string, string | undefined>,
): ParsedIronAuthConfig => {
  if (!config.adapter) {
    console.error('Iron Auth: No adapter was provided.');
    throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
  } else if (!Array.isArray(config.providers) || config.providers.length === 0) {
    console.error('Iron Auth: No providers were provided.');
    throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
  }

  const ironPassword = (env && env['IRON_AUTH_IRON_PASSWORD']) || config.iron?.password;
  const encryptionSecret = (env && env['IRON_AUTH_ENCRYPTION_SECRET']) || config.encryptionSecret;
  const csrfSecret = (env && env['IRON_AUTH_CSRF_SECRET']) || config.csrfSecret;

  if (!ironPassword) {
    console.error('Iron Auth: No iron password was provided.');
    throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
  } else if (!csrfSecret) {
    console.error('Iron Auth: No csrf secret was provided.');
    throw new IronAuthError({ code: 'CONFIG_ERROR', message: 'Invalid config' });
  }

  const parsedConfig: ParsedIronAuthConfig = {
    debug: config.debug ?? false,

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

    iron: {
      cookieName: config.iron?.cookieName ?? 'iron-auth',
      password: ironPassword,
      ttl: config.iron?.ttl ?? 7 * 24 * 60 * 60,
      cookieOptions: config.iron?.cookieOptions,
    },

    encryptionSecret,
    csrfSecret,

    csrfOptions: {
      name: config.csrfOptions?.name ?? 'iron-auth.csrf',
      httpOnly: config.csrfOptions?.httpOnly ?? true,
      sameSite: config.csrfOptions?.sameSite ?? 'lax',
      path: config.csrfOptions?.path ?? '/',
      secure: config.csrfOptions?.secure ?? true,
    },

    redirects: config.redirects,
  };

  return parsedConfig;
};
