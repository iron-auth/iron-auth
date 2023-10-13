import type { IncomingRequest } from '../../../types';

export const fromEntries = (
	entries: [string, string | string[] | undefined][],
): Record<string, string | string[]> => {
	return entries.reduce((acc, [key, value]) => (value ? { ...acc, [key]: value } : acc), {});
};

export const refineQueryParams = (
	req: IncomingRequest,
	path: string,
): Partial<{ [key: string]: string | string[] }> => {
	let queryParams = ('params' in req && req.params) || ('query' in req && req.query) || {};

	if (!Object.keys(queryParams ?? {}).length) {
		queryParams = fromEntries([
			...((req.url?.includes('?') && new URL(req.url).searchParams?.entries()) || []),
			['ironauth', path],
		]);
	}

	return queryParams;
};
