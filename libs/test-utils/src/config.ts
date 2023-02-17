import { credentialsProvider } from 'iron-auth';
import type { GenericAdapterConfig, IronAuthConfig } from 'iron-auth/types';

export const ironAuthOptions = (adapter: GenericAdapterConfig, debug = false): IronAuthConfig => ({
  debug,
  iron: {
    cookieName: 'iron-auth.session',
    password: '53cF#DPPWcAbFnu726J!$9@s4$%wGnxyS^z307SOW@8AQO9xu&',
  },
  adapter,
  providers: [credentialsProvider, { ...credentialsProvider, id: 'email-pass-provider-alt' }],
  encryptionSecret: 'Random dev secret',
  csrfSecret: 'Random dev csrf secret',
  redirects: {
    signIn: '/account',
  },
  restrictedMethods: {
    signIn: [{ type: 'credentials', id: 'email-pass-provider' }],
    linkAccount: [{ type: 'credentials', id: 'email-pass-provider-alt' }],
  },
});
