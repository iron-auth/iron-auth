import type { AdapterConfig } from 'iron-auth/types';
import type { Kysely } from 'kysely';

import type { Database } from '../types';

const accountSelect = [
	'id',
	'user_id',
	'type',
	'provider',
	'provider_account_id',
	'provider_account_data',
] satisfies (keyof Database['accounts'])[];

const userSelect = [
	'id',
	'name',
	'username',
	'email',
	'image',
] satisfies (keyof Database['users'])[];

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
		accountData = null,
		username = null,
		name = null,
		image = null,
		email = null,
	}) => {
		const user = userId
			? await db
					.selectFrom('users')
					.select(userSelect)
					.where('id', '=', userId)
					.executeTakeFirstOrThrow()
			: await db
					.insertInto('users')
					.values({ created_at: new Date(), name, username, email, image })
					.returning(userSelect)
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
			.returning(accountSelect)
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
			.select(accountSelect)
			.where((eb) =>
				eb.and([
					eb('type', '=', type),
					eb('provider', '=', providerId),
					eb('provider_account_id', '=', accountId),
					...(accountData ? [eb('provider_account_data', '=', accountData)] : []),
				]),
			)
			.executeTakeFirst();
		if (!account) return null;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const user = (await db
			.selectFrom('users')
			.select(userSelect)
			.where('id', '=', account.user_id)
			// NOTE: Foreign key constraint ensures that this is never null.
			.executeTakeFirst())!;

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
