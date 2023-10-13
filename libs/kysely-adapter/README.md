# @iron-auth/kysely-adapter

This package provides a Kysely adapter for use with Iron Auth.

## Installation

```bash
npm install @iron-auth/kysely-adapter
```

## Usage

```ts
import { kyselyAdapter } from '@iron-auth/kysely-adapter';

const config: IronAuthConfig = {
	// ...
	adapter: kyselyAdapter(db),
	// ...
};
```

## Schema

For convenience, we also export functions to easily build your database schema for Kysely and Iron Auth. We only advise using this for new projects - otherwise, you should create your own migrations as you normally would.

### Postgres

```ts
import { buildPostgresTables } from '@iron-auth/kysely-adapter/builders/postgres';

// ...

await buildPostgresTables(db);
```

### Typings

The [types](https://github.com/iron-auth/iron-auth/blob/main/libs/kysely-adapter/types/index.ts) for the tables are also exported and can imported into your own Kysely code if you wish.

```ts
import type { AccountTable, UserTable, VerificationToken } from '@iron-auth/kysely-adapter/types';

export interface Database {
	accounts: AccountTable;
	users: UserTable;
	verification_tokens: VerificationToken;

	// ...
}
```
