# Iron Auth

A modular authentication library, designed with the Edge as a priority and built to be framework agnostic. Powered by Iron Session under the hood. Extendable, highly configurable, and extensively tested.

Inspiration for the library's design was drawn from Next Auth, as well as database schema similarities for ease when switching between the two.

## Features

### Modular

- **Database Adapters** - Bring your own adapters, or choose an existing one.
- **Authentication Providers** - Bring your own providers for account data, or choose from existing ones.
  - **OAuth** - ~~Works with any OAuth service.~~ Coming soon.
  - **Credentials** - First-class support for credentials providers.
  - **Passwordless** - ~~Supports authentication via email.~~ Coming soon.
  - **Two-Factor Auth** - ~~Enable multi-factor authentication for users.~~ Coming soon.

### Take Control

- **Account Linking on Demand** - Link accounts at any time using a specific link account auth method, link accounts automatically on sign up, or not at all.
- **Session Modification** - Modify session data at any time using server-side methods.
- **Retrieve Session on the Server** - Retrieve session data on the server using server-side methods.
- **Verify CSRF Tokens on Demand** - Verify CSRF tokens using server-side methods at any time. Useful for verifying requests when extending the library's functionality.
- **Iron Session** - Iron Session is the underlying library used to manage session cookies. Their functions can be used directly from their library if needed.

### Secure

- **Encrypted Session Cookies - Iron Session** - Session data is encrypted and stored as cookies using [Iron Session](https://github.com/vvo/iron-session), the library we use to manage session cookies. We recommend taking a look at their documentation if you need more information about how the session cookies work.
- **CSRF Tokens** - Cross-Site Request Forgery tokens are generated and verified for all POST requests.
- **Multi-Factor Authentication** - ~~Designed to support two-factor authentication using TOTP.~~ Coming soon.
- **Extensively Tested** - The library is extensively tested to ensure that it is secure, stable, and ready to be deployed.

### Highly Configurable

- **Restrict Auth Methods** - Restrict certain authentication methods to be usable only by specific authentication providers.
- **Disable Auth Methods** - Disable certain authentication methods completely.
- **Redirects on Success / Error** - Use custom redirects for specific routes (e.g. on signup) or when errors occur. Use a specific string or a function to evaluate response data and return a string.

### Multiple Languages

- **TypeScript** - The library is written in TypeScript and includes type definitions.
- **Golang** - An implementation of Iron, Iron Session, and Iron Auth in Golang is planned.

## Installation

To get started with Iron Auth, install the [core library](https://github.com/iron-auth/iron-auth/tree/main/libs/iron-auth).

```bash
npm install iron-auth
```

If you are using Next.js, you should also install the [Next.js package](https://github.com/iron-auth/iron-auth/tree/main/libs/next). If you are using the Edge runtime, skip this step.

```bash
npm install @iron-auth/next
```

## Usage

Check out the documentation site for information about using Iron Auth - Coming soon!

## Roadmap

While all features listed above are fully functional unless otherwise stated, this project is still under active development.

##### Core

- [ ] Request handler for non-Next.js and non-Edge apps
- [ ] Database adapter for Kysely
- [ ] Generic OAuth authentication provider
- [ ] Support for running your own OAuth service

##### Other Languages

- [ ] Golang implementation of iron-webcrypto / @hapi/iron
- [ ] Golang implementation of Iron Session
- [ ] Golang implementation of Iron Auth

##### Examples

- [ ] Next.js example
- [ ] Itty router Cloudflare worker example
- [ ] Express.js example

##### Other

- [ ] Documentation website
- [ ] Create release workflows

## Security

If you believe there is a security issue in the library, please read our [security policy](https://github.com/iron-auth/iron-auth/blob/main/SECURITY.md) and get in contact with us.

## Contributing

Contributions and pull requests are welcome. Please read our [contribution guidelines](https://github.com/iron-auth/iron-auth/blob/main/CONTRIBUTING.md).
