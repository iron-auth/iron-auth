# iron-auth

## Installation

```bash
npm install iron-auth
```

## Usage

To use Iron Auth, you need to call the `ironAuthHandler` function from your API route with the following arguments:

- `req`: The request object from your API route. This is used to get the request method, path, and headers.
- `config`: An object containing the configuration options for Iron Auth.
- `env`: An object containing the environment variables for your application. If they are not set, it falls back to the config to check for them. The environment variables are:
  - `IRON_AUTH_URL` - The URL for your web app.
  - `IRON_AUTH_IRON_PASSWORD` - Used by Iron Session for session cookies.
  - `IRON_AUTH_ENCRYPTION_SECRET` - Used for encrypting data in the database.
  - `IRON_AUTH_CSRF_SECRET` - Used for CSRF tokens.
  - `IRON_AUTH_OAUTH_SECRET` - Used for OAuth-related cookies.

As this library is Edge-first, it prefers to use WebCrypto. If you are in an environment where WebCrypto is not available, you can import from iron-auth/node and it will use the `@peculiar/webcrypto` polyfill.

### API Route

```ts
import type { IronAuthConfig } from 'iron-auth';
// In environments where WebCrypto is not available, import from `iron-auth/node` instead.
import { ironAuthHandler } from 'iron-auth';

export const ironAuthConfig: IronAuthConfig = {
	// ...
};

export default function handler(req) {
	/*
	 * Depending on which runtime, cloud provider, or build steps you are using, you may need to
	 * retrieve the environment variables from `req`, or they might be available in `process.env`, or
	 * they could be passed as an argument to the handler function.
	 */
	const env = {
		/* ... */
	};

	return ironAuthHandler(req, ironAuthConfig, env);
}
```

### Retrieve the session on the server

```ts
import { getServerSideSession } from 'iron-auth';
// Import your config so that `getServerSideSession` can use it.
import { ironAuthConfig } from '...';

const getSession = async (req) => {
	let session;
	try {
		// Make sure to pass in your environment variables.
		session = await getServerSideSession(req, ironAuthConfig, env);
	} catch (error) {
		// Handle error when there is no session.
		session = null;
	}

	return session;
};
```
