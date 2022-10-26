# Iron Auth

A modular authentication library, designed with the Edge as a priority and built for Next.js. Powered by Iron Session under the hood. Extendable, highly configurable, and extensively tested.

Inspiration for the library's design was drawn from [NextAuth.js](https://next-auth.js.org/), as well as database schema similarities for switching between the two.

## Features

### Modular

- **Database Adapters** - Bring your own adapters, or choose an existing one.
- **Authentication Providers** - Bring your own providers for account data, or choose from existing ones.

### Highly Configurable

- **Restrict Auth Methods** - Restrict certain authentication methods to be usable only by specific authentication providers.
- **Disable Auth Methods** - Disable certain authentication methods completely.
- **Redirects on Success / Error** - Use custom redirects for specific routes (e.g. on signup) or when errors occur. Use a specific string or a function to evaluate response data and return a string.

### Take Control

- **Account Linking on Demand** - Link accounts at any time using a specific link account auth method, link accounts automatically on sign up, or not at all.
- **Session Modification** - Modify session data at any time using server-side methods.
- **Retrieve Session on the Server** - Retrieve session data on the server using server-side methods.
- **Verify CSRF Tokens on Demand** - Verify CSRF tokens using server-side methods at any time. Useful for verifying requests when extending the library's functionality.
- **Iron Session** - Iron Session is the underlying library used to manage session cookies. Their functions can be used directly from their library if needed.

### Secure

- **Encrypted Session Cookies - Iron Session** - Session data is encrypted and stored as cookies using [Iron Session](https://github.com/vvo/iron-session), the library we use to manage session cookies. We recommend taking a look at their documentation if you need more information about how the session cookies work.
- **CSRF Tokens** - Cross-Site Request Forgery tokens are generated and verified for all POST requests.

## Roadmap

While all features listed above are fully functional, this project is still under active development and not yet released to npm.

- [ ] Generic OAuth authentication provider
- [ ] Next.js example
- [ ] Itty router Cloudflare worker example
- [ ] Documentation

## Usage

To be added.

## Contributing

Contributions and pull requests are welcome. I ask that you please open an issue to discuss any changes you would like to make before submitting a pull request. All pull requests should go to the `dev` branch.
