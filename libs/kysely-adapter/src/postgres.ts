import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import type { Database } from './db';

export const buildPostgresTables = async (db: Kysely<Database>) => {
  await db.schema
    .createTable('verification_tokens')
    .addColumn('identifier', 'text', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull())
    .addColumn('expires', 'timestamptz', (col) => col.notNull())
    .addUniqueConstraint('verification_tokens_pkey', ['identifier', 'token'])
    .execute();

  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.notNull())
    .addColumn('name', 'text')
    .addColumn('username', 'text', (col) => col.unique())
    .addColumn('email', 'text', (col) => col.unique())
    .addColumn('email_verified', 'timestamptz')
    .addColumn('image', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addPrimaryKeyConstraint('users_pkey', ['id'])
    .execute();

  await db.schema
    .createTable('accounts')
    .addColumn('id', 'uuid', (col) =>
      col
        .notNull()
        .primaryKey()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('provider', 'text', (col) => col.notNull())
    .addColumn('provider_account_id', 'text', (col) => col.notNull())
    .addColumn('provider_account_data', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('refresh_token', 'text')
    .addColumn('access_token', 'text')
    .addColumn('expires_at', 'timestamptz')
    .addColumn('token_type', 'text')
    .addColumn('scope', 'text')
    .addColumn('id_token', 'text')
    .addColumn('session_state', 'text')
    .addForeignKeyConstraint('accounts_user_id_fkey', ['user_id'], 'users', ['id'])
    .addUniqueConstraint('accounts_unique', ['provider', 'provider_account_id'])
    .execute();

  await db.schema.createIndex('accounts_user_id_index').on('accounts').column('user_id').execute();
};
