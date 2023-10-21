import { kyselyAdapter } from '@iron-auth/kysely-adapter';
import { ironAuthHandler } from 'iron-auth';
import { http } from 'msw';
import { setupServer } from 'msw/node';

import { ironAuthOptions } from './config';
import { apiUrl } from './constants';
import { setupKysely } from './kysely';

export const mockApi = async () => {
	const db = await setupKysely();
	const opts = ironAuthOptions(kyselyAdapter(db));

	const cookieBasket = new Map<string, string>();

	const handlers = [
		http.all(`${apiUrl}/:ironauth`, async ({ request }) => {
			request.headers.set(
				'cookie',
				[...cookieBasket.entries()].map(([name, value]) => `${name}=${value}`).join('; '),
			);

			const resp = await ironAuthHandler(request, opts);

			resp.headers.getSetCookie().forEach((cookie) => {
				const [name, value] = cookie.split(';')[0]?.split('=') ?? [];
				if (name) {
					if (!value) {
						cookieBasket.delete(name);
					} else {
						cookieBasket.set(name, value);
					}
				}
			});

			return resp;
		}),
	];

	const server = setupServer(...handlers);

	return {
		start: () => server.listen({ onUnhandledRequest: 'error' }),
		stop: () => {
			server.close();
			cookieBasket.clear();
		},
		reset: () => {
			server.resetHandlers();
			cookieBasket.clear();
		},
	};
};
