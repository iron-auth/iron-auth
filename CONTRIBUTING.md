# Contributing

We welcome contributions and pull requests from anyone, whether it be a spelling mistake or a new feature.

Please read the following guidelines before contributing.

## Pull Requests

If you would like to make a significant change to the library, please open an issue first to discuss it. This will help us avoid any wasted work.

Otherwise, feel free to open a pull request with your changes.

### Guidelines

Please use pnpm to install dependencies and run scripts.

- Fork the repository.
- Make your changes in a new git branch:
  - We use `eslint` for linting and `prettier` for formatting. Please resolve any errors or warnings before submitting a pull request.
  - If your changes will impact functionality, please consider writing tests with `vitest` and modfying the relevant documentation.
- Open a pull request against the `dev` branch.
- Pull requests need approval from a member of the core team before they can be merged.

### Local Development

You can either use a cloud development environment or clone the repository to your hard drive.

#### Cloning the Repository

You can clone the repository to your hard drive and run the following commands:

```bash
git clone https://github.com/iron-auth/iron-auth
cd iron-auth

pnpm i
```

## Reporting Issues

For security issues, please refer to our [security policy](https://github.com/iron-auth/iron-auth/blob/main/SECURITY.md).

If you find a bug, please report it by opening a new issue and including the following information:

- The version of the library you are using.
- The version of the language you are using.
- The operating system you are using.
- The steps required to reproduce the bug.
- Any other information that you think might be helpful.
