import type { AdapterConfig } from 'iron-auth/types';
import type { Kysely } from 'kysely';
import type { Database } from '../types';

/**
 * A Kysely adapter for Iron Auth.
 *
 * It enables using Kysely as a data source for the database that stores the Iron Auth data.
 *
 * @param db - The Kysely db instance.
 * @returns The adapter.
 */
export const kyselyAdapter = (db: Kysely<Database>): AdapterConfig => ({
  create: async ({
    userId,
    type,
    providerId,
    accountId,
    username = null,
    name = null,
    image = null,
    email = null,
    accountData = null,
  }) => {
    const user = userId
      ? await db
          .selectFrom('users')
          .select(['id', 'name', 'username', 'email', 'image'])
          .where('id', '=', userId)
          .executeTakeFirstOrThrow()
      : await db
          .insertInto('users')
          .values({
            created_at: new Date(),
            name,
            username,
            email,
            image,
          })
          .returning(['id', 'name', 'username', 'email', 'image'])
          .executeTakeFirstOrThrow();

    const account = await db
      .insertInto('accounts')
      .values({
        created_at: new Date(),
        user_id: user.id,
        type,
        provider: providerId,
        provider_account_id: accountId,
        provider_account_data: accountData,
      })
      .returning([
        'id',
        'user_id',
        'type',
        'provider',
        'provider_account_id',
        'provider_account_data',
      ])
      .executeTakeFirstOrThrow();

    return {
      id: account.id,
      userId: account.user_id,

      type: account.type,
      provider: account.provider,
      providerAccountId: account.provider_account_id,
      providerAccountData: account.provider_account_data,

      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
      },
    };
  },

  findAccount: async ({ type, providerId, accountId, accountData }) => {
    const account = await db
      .selectFrom('accounts')
      .select(['id', 'user_id', 'type', 'provider', 'provider_account_id', 'provider_account_data'])
      .where((qb) => {
        let newQb = qb;

        newQb = qb
          .where('type', '=', type)
          .where('provider', '=', providerId)
          .where('provider_account_id', '=', accountId);
        if (accountData) newQb = newQb.where('provider_account_data', '=', accountData);

        return newQb;
      })
      .executeTakeFirst();
    if (!account) return null;

    const user = await db
      .selectFrom('users')
      .select(['id', 'name', 'username', 'email', 'image'])
      .where('id', '=', account.user_id)
      .executeTakeFirst();
    if (!user) return null;

    return {
      id: account.id,
      userId: account.user_id,

      type: account.type,
      provider: account.provider,
      providerAccountId: account.provider_account_id,
      providerAccountData: account.provider_account_data,

      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
      },
    };
  },
});
