import type { IncomingRequest } from '../../../types';

const tryParse = async (cb: () => Promise<object>, fallback = {}) => {
	try {
		return (await cb()) || fallback;
	} catch (e) {
		return fallback;
	}
};

export const refineBody = async (req: IncomingRequest): Promise<Record<string, unknown>> => {
	let body = {};

	if ('body' in req) {
		if ('json' in req && typeof req.json === 'function') {
			body = await tryParse(async () => (await req.json()) || '{}');
		} else if ('text' in req && typeof req.text === 'function') {
			body = await tryParse(async () => JSON.parse((await req.text()) || ''));
		} else if (typeof req.body === 'string') {
			body = await tryParse(() => JSON.parse((req.body as string) || '{}'));
		} else if (typeof req.body === 'object') {
			body = req.body || {};
		} else {
			// No request body.
		}
	}

	return body;
};
