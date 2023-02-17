import type { Database } from '@iron-auth/kysely-adapter/src/db';
import { buildPostgresTables } from '@iron-auth/kysely-adapter/src/postgres';
import { Kysely, PostgresDialect } from 'kysely';
import { DataType, newDb } from 'pg-mem';

export const setupKysely = async () => {
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

export const countKyselyTable = async (db: Kysely<Database>, table: 'users' | 'accounts') => {
  const { count } = db.fn;

  const records = await db.selectFrom(table).select(count('id').as('id_count')).executeTakeFirst();

  return records?.id_count ?? 0;
};

export type KyselyDb = Kysely<Database>;
