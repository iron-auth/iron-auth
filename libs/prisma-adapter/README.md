# @iron-auth/prisma-adapter

This package provides a Prisma adapter for use with Iron Auth.

## Installation

```bash
npm install @iron-auth/prisma-adapter
```

## Usage

```ts
import { prismaAdapter } from '@iron-auth/prisma-adapter';

const config: IronAuthConfig = {
  // ...
  adapter: prismaAdapter(prisma),
  // ...
};
```
