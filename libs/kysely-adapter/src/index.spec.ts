import crypto from 'crypto';
import { Kysely, PostgresDialect } from 'kysely';
import { DataType, newDb } from 'pg-mem';
import { afterAll, beforeAll, expect, suite, test } from 'vitest';
import { buildPostgresTables } from '../builders/postgres';
import type { Database } from '../types';
import { kyselyAdapter } from '.';

let db: Kysely<Database>;

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

beforeAll(async () => {
  db = await setupKysely();
});

afterAll(async () => {
  await db.destroy();
});

suite('kysely-adapter', () => {
  test('no result when account doesnt exist', async () => {
    const adapter = kyselyAdapter(db as Kysely<Database>);

    const account = await adapter.findAccount({
      type: 'credentials',
      providerId: 'email-pass-provider',
      accountId: '',
      accountData: null,
    });

    expect(account).toEqual(null);
  });

  test('creates account', async () => {
    const adapter = kyselyAdapter(db);

    const account = await adapter.create({
      type: 'credentials',
      providerId: 'email-pass-provider',
      accountId: 'test',
      accountData: null,
      name: 'test',
    });

    expect(account.id).toEqual(expect.any(String));
    expect(account.userId).toEqual(1);
    expect(account.type).toEqual('credentials');
    expect(account.provider).toEqual('email-pass-provider');
    expect(account.providerAccountId).toEqual('test');
    expect(account.providerAccountData).toEqual(null);
    expect(account.user.id).toEqual(account.userId);
    expect(account.user.name).toEqual('test');
  });

  test('finds account', async () => {
    const adapter = kyselyAdapter(db);

    const account = await adapter.findAccount({
      type: 'credentials',
      providerId: 'email-pass-provider',
      accountId: 'test',
      accountData: null,
    });

    expect(account?.id).toEqual(expect.any(String));
    expect(account?.userId).toEqual(1);
    expect(account?.type).toEqual('credentials');
    expect(account?.provider).toEqual('email-pass-provider');
    expect(account?.providerAccountId).toEqual('test');
    expect(account?.providerAccountData).toEqual(null);
    expect(account?.user.id).toEqual(account && account.userId);
    expect(account?.user.name).toEqual('test');
  });

  test('created account with data', async () => {
    const adapter = kyselyAdapter(db);

    const account = await adapter.create({
      type: 'credentials',
      providerId: 'email-pass-provider',
      accountId: 'test2',
      accountData: JSON.stringify({ password: 'random' }),
      name: 'test2',
    });

    expect(account.id).toEqual(expect.any(String));
    expect(account.userId).toEqual(2);
    expect(account.type).toEqual('credentials');
    expect(account.provider).toEqual('email-pass-provider');
    expect(account.providerAccountId).toEqual('test2');
    expect(account.providerAccountData).toEqual(JSON.stringify({ password: 'random' }));
    expect(account.user.id).toEqual(account.userId);
    expect(account.user.name).toEqual('test2');
  });

  test('finds account with data', async () => {
    const adapter = kyselyAdapter(db);

    const account = await adapter.findAccount({
      type: 'credentials',
      providerId: 'email-pass-provider',
      accountId: 'test2',
      accountData: JSON.stringify({ password: 'random' }),
    });

    expect(account?.id).toEqual(expect.any(String));
    expect(account?.userId).toEqual(2);
    expect(account?.type).toEqual('credentials');
    expect(account?.provider).toEqual('email-pass-provider');
    expect(account?.providerAccountId).toEqual('test2');
    expect(account?.providerAccountData).toEqual(JSON.stringify({ password: 'random' }));
    expect(account?.user.id).toEqual(account && account.userId);
    expect(account?.user.name).toEqual('test2');
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
});
