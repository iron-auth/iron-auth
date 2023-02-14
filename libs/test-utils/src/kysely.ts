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

export type KyselyDb = Kysely<Database>;
