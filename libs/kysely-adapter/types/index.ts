import type { ColumnType, Generated } from 'kysely';

export interface VerificationToken {
  identifier: ColumnType<string, string, never>;
  token: ColumnType<string, string, never>;
  expires: ColumnType<Date, Date, never>;
}

export interface AccountTable {
  id: Generated<string>;
  user_id: ColumnType<number, number, never>;
  type: ColumnType<string, string, never>;
  provider: ColumnType<string, string, never>;
  provider_account_id: ColumnType<string, string, never>;
  provider_account_data: string | null;
  created_at: ColumnType<Date, Date, never>;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: Date | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface UserTable {
  id: Generated<number>;
  name: string | null;
  username: string | null;
  email: string | null;
  email_verified: Date | null;
  image: string | null;
  created_at: ColumnType<Date, Date, never>;
}

export interface Database {
  verification_tokens: VerificationToken;
  accounts: AccountTable;
  users: UserTable;
}
