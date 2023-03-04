import type { Session } from '../session';
import type { ProviderType } from './provider';

type UserId = NonNullable<Session['user']>['id'];

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
 * A generic configuration implemented by all adapters.
 */
export type AdapterConfig = {
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
