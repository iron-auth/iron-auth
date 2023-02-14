# iron-auth

## Installation

```bash
npm install iron-auth
```

## Usage

### Edge runtime

```ts
import { ironAuthHandler } from 'iron-auth/edge';

export default function handler(req) {
  const ironAuthOptions = {
    // ...
  };

  /*
   * Depending on which edge runtime, cloud provider, or build steps you are using, you may need to
   * retrieve the environment variables from `req`, or they might be available in `process.env`, or
   * they could be passed as an argument to the handler function.
   */
  const env = {};

  return ironAuthHandler(ironAuthOptions, req, env);
}
```

### Next.js

When using Next.js, you should use the `ironAuthHandler` from `@iron-auth/next`.
