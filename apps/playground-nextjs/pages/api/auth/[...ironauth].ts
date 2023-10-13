import { kyselyAdapter } from '@iron-auth/kysely-adapter';
import type { Database } from '@iron-auth/kysely-adapter/types';
import { setupKysely } from '@libs/test-utils';
import { ironAuthOptions } from '@libs/test-utils/src/config';
import type { IronAuthConfig } from 'iron-auth';
import { ironAuthHandler } from 'iron-auth/node';
import type { Kysely } from 'kysely';
import type { NextApiRequest } from 'next';
// import type { NextRequest, NextResponse } from 'next/server';

let opts: IronAuthConfig | undefined;
let kysely: Kysely<Database>;
export const getIronAuthOptions = async (debug = false) => {
	if (!opts || !kysely) {
		kysely = await setupKysely();
		opts = { ...ironAuthOptions(kyselyAdapter(kysely), debug), accountLinkingOnSignup: false };
	}

	return opts;
};
export const getKysely = () => kysely;

const handler = async (req: NextApiRequest) =>
	ironAuthHandler(req, await getIronAuthOptions(true), {});

export default handler;
