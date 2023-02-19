# iron-auth

## Installation

```bash
npm install iron-auth
```

## Usage

To use Iron Auth, you need to call the `ironAuthHandler` function from your API route with the following arguments:

- `config`: An object containing the configuration options for Iron Auth.
- `req`: The request object from your API route. This is used to get the request method, path, and headers.
- `res`: The response object from your API route. This is used to set the `Set-Cookie` header. This parameter is not present on the Edge runtime handler.
- `env`: An object containing the environment variables for your application. This is used to get the `IRON_AUTH_IRON_PASSWORD`, `IRON_AUTH_ENCRYPTION_SECRET`, and `IRON_AUTH_CSRF_SECRET` environment variables. If they are not set, it falls back to the config to check for them.

### Node.js

```ts
import type { IronAuthConfig } from 'iron-auth';
import { ironAuthHandler } from 'iron-auth/node';

const config: IronAuthConfig = {
  // ...
};

export default function handler(req, res) {
  return ironAuthHandler(config, req, res, process.env);
}
```

### Edge runtime

```ts
import type { IronAuthConfig } from 'iron-auth';
import { ironAuthHandler } from 'iron-auth/edge';

const config: IronAuthConfig = {
  // ...
};

export default function handler(req) {
  /*
   * Depending on which edge runtime, cloud provider, or build steps you are using, you may need to
   * retrieve the environment variables from `req`, or they might be available in `process.env`, or
   * they could be passed as an argument to the handler function.
   */
  const env = {
    /* ... */
  };

  return ironAuthHandler(config, req, env);
}
```
