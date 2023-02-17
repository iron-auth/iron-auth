import { mock } from 'vitest-mock-extended';
import { ironAuthHandler } from 'iron-auth/edge';
import type { Database } from '@iron-auth/kysely-adapter/src/db';
import {
  ironAuthOptions,
  getCsrfToken as getCsrfTokenOriginal,
  setupKysely,
} from '@libs/test-utils';
import { kyselyAdapter } from '@iron-auth/kysely-adapter';
import type { Kysely } from 'kysely';
import type { IronAuthConfig } from 'iron-auth/types';

let opts: IronAuthConfig | undefined;
let kysely: Kysely<Database>;
export const getIronAuthOptions = async (debug = false) => {
  if (!opts || !kysely) {
    kysely = await setupKysely();
    opts = ironAuthOptions(kyselyAdapter(kysely), debug);
  }

  return opts;
};
export const getKysely = () => kysely;

export const getCsrfToken = async () => {
  const req = mock<Request>(
    new Request('https://localhost:3000/api/auth/csrf', {
      method: 'GET',
      headers: {},
      body: null,
      credentials: 'same-origin',
    }),
  );

  const resp = await ironAuthHandler(await getIronAuthOptions(), req, undefined);

  return getCsrfTokenOriginal(resp);
};
