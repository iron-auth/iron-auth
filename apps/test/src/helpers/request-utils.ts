import { prismaAdapter } from '@iron-auth/prisma-adapter';
import {
	getCsrfToken as getCsrfTokenOriginal,
	getHttpMock,
	ironAuthOptions,
} from '@libs/test-utils';
import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { ironAuthHandler } from 'iron-auth/node';
import type { IronAuthConfig } from 'iron-auth/types';
import { createPrismaClient } from 'prisma-mock-vitest';

let opts: IronAuthConfig | undefined;
let prisma: PrismaClient;
export const getIronAuthOptions = async () => {
	if (!opts || !prisma) {
		prisma = await createPrismaClient<PrismaClient>({}, Prisma.dmmf.datamodel);
		opts = ironAuthOptions(prismaAdapter(prisma));
	}

	return opts;
};
export const getPrisma = () => prisma;

export const resetPrisma = async () => {
	if (prisma) {
		const models = Object.keys(prisma).filter((k) => !k.startsWith('_'));
		// @ts-expect-error - They are valid keys.
		await Promise.all(models.map((m) => prisma[m].deleteMany()));
	}
};

export const getCsrfToken = async () => {
	const { req } = getHttpMock({
		method: 'GET',
		query: {
			ironauth: 'csrf',
		},
	});

	const res = await ironAuthHandler(req, await getIronAuthOptions());

	return getCsrfTokenOriginal(res);
};
