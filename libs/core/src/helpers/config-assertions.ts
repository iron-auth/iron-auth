import type { InternalRequest, ParsedIronAuthConfig } from '../../types';
import { IronAuthError } from './iron-auth-error';

export const assertSecret = (config: ParsedIronAuthConfig) => {
  if (!config.encryptionSecret) {
    console.error('Iron Auth: No encryption secret provided');
    throw new IronAuthError({
      code: 'CONFIG_ERROR',
      message: 'Invaild config',
    });
  }

  return config.encryptionSecret;
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

  if (route) {
    // Disallow using disabled methods.
    if (config.disabledMethods[route] === true) {
      throw new IronAuthError({
        code: 'BAD_REQUEST',
        message: 'This method is disabled',
      });
    }

    // Disallow using providers that are not enabled for the route
    if (
      Array.isArray(config.restrictedMethods[route]) &&
      !config.restrictedMethods[route]?.find((p) => p.type === type && p.id === providerId)
    ) {
      throw new IronAuthError({
        code: 'BAD_REQUEST',
        message: 'Provider not allowed for this method',
      });
    }
  }

  return provider;
};
