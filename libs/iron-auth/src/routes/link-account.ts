import type { IronSession } from 'iron-session';
import type { InternalRequest, ParsedIronAuthConfig } from '../../types';
import { assertProvider, assertSecret, encrypt, IronAuthError } from '../helpers';

export const linkAccountRoute = async (
  req: InternalRequest,
  config: ParsedIronAuthConfig,
  session: IronSession,
) => {
  const provider = assertProvider(req, config, 'linkAccount');

  switch (provider.type) {
    case 'credentials': {
      // Handle credentials link account
      const credentials = provider.precheck<{ email: string; password: string }>(req);

      if (credentials) {
        const { email, password } = credentials;

        try {
          if (!session.user) {
            throw new IronAuthError({
              code: 'BAD_REQUEST',
              message: 'Not signed in',
            });
          }

          const { combined: encryptedPassword } = await encrypt(password, assertSecret(config));

          const account = await config.adapter.findAccount({
            type: provider.type,
            providerId: provider.id,
            accountId: email,
          });

          if (account) {
            throw new IronAuthError({ code: 'BAD_REQUEST', message: 'Account already exists' });
          }

          const data = await config.adapter.create({
            userId: session.user.id,
            type: provider.type,
            providerId: provider.id,
            accountId: email,
            accountData: encryptedPassword,
            email,
          });

          if (data.user) {
            return data.user;
          }
        } catch (error) {
          if (config.debug) {
            console.error('Error linking account:', error instanceof Error ? error.message : error);
          }

          if (error instanceof IronAuthError) {
            throw error;
          }

          throw new IronAuthError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected error linking account',
          });
        }
      }
      break;
    }
    default: {
      throw new IronAuthError({
        code: 'BAD_REQUEST',
        message: 'Unexpected error linking account',
      });
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
  id: string;
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
