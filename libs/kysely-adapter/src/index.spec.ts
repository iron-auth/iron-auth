import { Kysely, PostgresDialect } from 'kysely';
import { DataType, newDb } from 'pg-mem';
import { afterAll, beforeAll, expect, suite, test } from 'vitest';

import { buildPostgresTables } from '../builders/postgres';
import type { Database } from '../types';
import { kyselyAdapter } from '.';

const setupKysely = async () => {
	const memDb = newDb();

	memDb.public.registerFunction({
		name: 'gen_random_uuid',
		implementation: () => crypto.randomUUID(),
		returns: DataType.uuid,
		impure: true,
	});

	const kysely = new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new (memDb.adapters.createPg().Pool)(),
		}),
	});

	await buildPostgresTables(kysely);

	return kysely;
};

const basicUuidRegexp = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

suite('kysely-adapter', () => {
	let db: Kysely<Database>;

	beforeAll(async () => {
		db = await setupKysely();
	});

	afterAll(async () => {
		await db.destroy();
	});

	test('creates new account and returns it, with no provided user data', async () => {
		const adapter = kyselyAdapter(db);

		const account = await adapter.create({
			type: 'credentials',
			providerId: 'email-pass-provider',
			accountId: 'test',
		});

		expect(account).toEqual({
			id: expect.stringMatching(basicUuidRegexp),
			userId: 1,
			type: 'credentials',
			provider: 'email-pass-provider',
			providerAccountId: 'test',
			providerAccountData: null,
			user: { id: 1, name: null, username: null, email: null, image: null },
		});
	});

	test('creates new account and returns it, with the provided user data', async () => {
		const adapter = kyselyAdapter(db);

		const account = await adapter.create({
			type: 'credentials',
			providerId: 'email-pass-provider',
			accountId: 'test2',
			accountData: JSON.stringify({ password: 'random' }),
			name: 'test',
			username: 'test_username',
			email: 'test@test.local',
			image: 'test_image.png',
		});

		expect(account).toEqual({
			id: expect.stringMatching(basicUuidRegexp),
			userId: 2,
			type: 'credentials',
			provider: 'email-pass-provider',
			providerAccountId: 'test2',
			providerAccountData: JSON.stringify({ password: 'random' }),
			user: {
				id: 2,
				name: 'test',
				username: 'test_username',
				email: 'test@test.local',
				image: 'test_image.png',
			},
		});
	});

	test('creates new account and returns it for existing user', async () => {
		const adapter = kyselyAdapter(db);

		const account = await adapter.create({
			type: 'credentials',
			providerId: 'email-pass-provider',
			accountId: 'test3',
			userId: 2,
		});

		expect(account).toEqual({
			id: expect.stringMatching(basicUuidRegexp),
			userId: 2,
			type: 'credentials',
			provider: 'email-pass-provider',
			providerAccountId: 'test3',
			providerAccountData: null,
			user: {
				id: 2,
				name: 'test',
				username: 'test_username',
				email: 'test@test.local',
				image: 'test_image.png',
			},
		});
	});

	test('cant create account for same provider and account id', async () => {
		const adapter = kyselyAdapter(db);

		await expect(
			adapter.create({
				type: 'credentials',
				providerId: 'email-pass-provider',
				accountId: 'test',
				accountData: null,
				name: 'test',
			}),
		).rejects.toThrow('duplicate key value violates unique constraint');
	});

	test('finds account and returns it', async () => {
		const adapter = kyselyAdapter(db);

		const account = await adapter.findAccount({
			type: 'credentials',
			providerId: 'email-pass-provider',
			accountId: 'test',
			accountData: null,
		});

		expect(account).toEqual({
			id: expect.stringMatching(basicUuidRegexp),
			userId: 1,
			type: 'credentials',
			provider: 'email-pass-provider',
			providerAccountId: 'test',
			providerAccountData: null,
			user: { id: 1, name: null, username: null, email: null, image: null },
		});
	});

	test('finds account with user data and returns it', async () => {
		const adapter = kyselyAdapter(db);

		const account = await adapter.findAccount({
			type: 'credentials',
			providerId: 'email-pass-provider',
			accountId: 'test2',
			accountData: JSON.stringify({ password: 'random' }),
		});

		expect(account).toEqual({
			id: expect.stringMatching(basicUuidRegexp),
			userId: 2,
			type: 'credentials',
			provider: 'email-pass-provider',
			providerAccountId: 'test2',
			providerAccountData: JSON.stringify({ password: 'random' }),
			user: {
				id: 2,
				name: 'test',
				username: 'test_username',
				email: 'test@test.local',
				image: 'test_image.png',
			},
		});
	});

	test('returns null when finding account that doesnt exist', async () => {
		const adapter = kyselyAdapter(db);

		const account = await adapter.findAccount({
			type: 'credentials',
			providerId: 'email-pass-provider',
			accountId: 'invalid-account',
			accountData: null,
		});

		expect(account).toEqual(null);
	});

	test('cant delete users because of foreign key constraint with accounts table', async () => {
		// This test is for my sanity, to make sure the database is set up correctly.
		await expect(db.deleteFrom('users').where('id', '=', 1).execute()).rejects.toThrow(
			'violates foreign key constraint',
		);
	});
});
