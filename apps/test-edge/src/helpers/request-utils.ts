import { kyselyAdapter } from '@iron-auth/kysely-adapter';
import type { Database } from '@iron-auth/kysely-adapter/types';
import {
	getCsrfToken as getCsrfTokenOriginal,
	ironAuthOptions,
	setupKysely,
} from '@libs/test-utils';
import { ironAuthHandler } from 'iron-auth';
import type { IronAuthConfig } from 'iron-auth/types';
import type { Kysely } from 'kysely';

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
	const req = new Request('https://localhost:3000/api/auth/csrf', {
		method: 'GET',
		headers: {},
		body: null,
		credentials: 'same-origin',
	});

	const res = await ironAuthHandler(req, await getIronAuthOptions());

	return getCsrfTokenOriginal(res);
};
