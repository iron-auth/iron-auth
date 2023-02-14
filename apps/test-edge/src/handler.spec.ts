import { afterAll, beforeAll, expect, suite, test } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { credentialsProvider } from 'iron-auth';
import type { IronAuthConfig } from 'iron-auth/types';
import { ironAuthHandler } from 'iron-auth/edge';
import { kyselyAdapter } from '@iron-auth/kysely-adapter';
import type { KyselyDb } from '@libs/test-utils';
import { edgeErrorResponse, setupKysely } from '@libs/test-utils';

let db: KyselyDb;
let config: IronAuthConfig;

beforeAll(async () => {
  db = await setupKysely();

  config = {
    debug: true,

    adapter: kyselyAdapter(db),
    providers: [credentialsProvider],

    encryptionSecret: 'encryption_secret',
    csrfSecret: 'csrf_secret',

    iron: {
      password: 'iron_passwordiron_passwordiron_passwordiron_passwordiron_password',
    },
  };
});

afterAll(async () => {
  await db.destroy();
});

suite('edge runtime', () => {
  suite('iron auth handler', () => {
    test('no session', async () => {
      console.log('test');
      const req = mock<Request>(
        new Request('https://localhost:3000/api/auth/session', {
          method: 'GET',
          headers: {},
          body: null,
          credentials: 'same-origin',
        }),
      );

      const resp = await ironAuthHandler(config, req, {});
      const json = await resp.json();

      expect(json).toEqual(edgeErrorResponse('NO_SESSION', 'Session not found'));
    });
  });
});
