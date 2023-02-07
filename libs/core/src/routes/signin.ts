import type { IronSession } from 'iron-session';
import type { InternalRequest, ParsedIronAuthConfig } from '../../types';
import { assertProvider, assertSecret, compare, IronAuthError } from '../helpers';

export const signinRoute = async (
  req: InternalRequest,
  config: ParsedIronAuthConfig,
  session: IronSession,
) => {
  const provider = assertProvider(req, config, 'signIn');

  switch (provider.type) {
    case 'credentials': {
      // Handle credentials signin
      const credentials = provider.precheck<{ email: string; password: string }>(req);

      if (credentials) {
        const { email, password } = credentials;

        try {
          // Require users to be logged out before signing in again.
          if (session.user) {
            throw new IronAuthError({ code: 'BAD_REQUEST', message: 'Already signed in' });
          }

          const account = await config.adapter.findAccount({
            type: provider.type,
            providerId: provider.id,
            accountId: email,
          });

          let hash;
          try {
            hash =
              !!account &&
              !!account.providerAccountData &&
              (JSON.parse(account.providerAccountData) as { hash?: string })?.hash;

            if (!account || !hash) throw new Error();

            const validPassword = await compare(password, hash, assertSecret(config));
            if (!validPassword) throw new Error();
          } catch (error) {
            throw new IronAuthError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
          }

          // TODO: Option to log signin attempt geolocation information to database.

          if (account.user.id) {
            // eslint-disable-next-line no-param-reassign
            session.user = account.user;
            await session.save();

            return account.user;
          }
        } catch (error) {
          if (config.debug) {
            console.error('Error signing in:', error instanceof Error ? error.message : error);
          }

          if (error instanceof IronAuthError) {
            throw error;
          }

          throw new IronAuthError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected error signing in',
          });
        }
      }
      break;
    }
    default: {
      throw new IronAuthError({
        code: 'BAD_REQUEST',
        message: 'Unexpected error signing in',
      });
    }
  }

  throw new IronAuthError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected error signing in',
  });
};

export type SigninResponse = {
  /**
   * The user's unique ID in the database.
   */
  // TODO: Fix ID type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;
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
