import type { IronSession } from 'iron-session';
import type { InternalRequest, ParsedIronAuthConfig } from '../../types';
import { assertProvider, assertSecret, encrypt, IronAuthError } from '../utils';

export const signupRoute = async (
  req: InternalRequest,
  config: ParsedIronAuthConfig,
  session: IronSession,
) => {
  const provider = assertProvider(req, config, 'signUp');

  switch (provider.type) {
    case 'credentials': {
      // Handle credentials signup
      const credentials = provider.precheck<{ email: string; password: string }>(req);

      if (credentials) {
        const { email, password } = credentials;

        try {
          if (!config.accountLinkingOnSignup && session.user) {
            throw new IronAuthError({
              code: 'BAD_REQUEST',
              message: 'Already signed in',
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
            userId: session.user?.id,
            type: provider.type,
            providerId: provider.id,
            accountId: email,
            accountData: JSON.stringify({ hash: encryptedPassword }),
            email,
          });

          if (data.user) {
            // eslint-disable-next-line no-param-reassign
            session.user = data.user;
            await session.save();

            return data.user;
          }
        } catch (error) {
          if (config.debug) {
            console.error('Error creating user:', error instanceof Error ? error.message : error);
          }

          if (error instanceof IronAuthError) {
            throw error;
          }

          throw new IronAuthError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected error creating account',
          });
        }
      }
      break;
    }
    default: {
      throw new IronAuthError({
        code: 'BAD_REQUEST',
        message: 'Unexpected error creating account',
      });
    }
  }

  throw new IronAuthError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected error creating account',
  });
};

export type SignupResponse = {
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
