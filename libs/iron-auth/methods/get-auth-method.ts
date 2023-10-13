import type { ApiResponseDataType } from '../types';
import type { SharedFetchOptions } from './fetch-api-data';
import { fetchApiData, refineDefaultOpts } from './fetch-api-data';

export type GetAuthMethod<
	T extends ApiResponseDataType,
	// eslint-disable-next-line @typescript-eslint/ban-types
	ExtraOpts extends object = {},
> = (opts?: SharedFetchOptions & ExtraOpts) => Promise<T | null>;

/**
 * Make a `GET` request to the auth API endpoint.
 *
 * If the request fails, the promise will return null, unless the rejects option is set to true, in which case it will throw an error.
 *
 * @param path Path for the API route.
 * @param opts.rejects Whether the promise should reject on an error. By default, it returns null and does not throw the error.
 * @param opts.basePath Base path for the API. Defaults to '/api/auth'.
 * @returns The response from the API, or null if no response was received.
 */
export const getAuthMethod = <
	ResponseType extends ApiResponseDataType,
	// eslint-disable-next-line @typescript-eslint/ban-types
	ExtraOpts extends object = {},
>(
	path: string,
	opts?: SharedFetchOptions & ExtraOpts,
): Promise<ResponseType | null> => {
	const { rejects, basePath } = refineDefaultOpts(opts ?? {});

	return fetchApiData<ResponseType>(`/${path}`, { method: 'GET' }, { basePath, name: path })
		.then((data) => data)
		.catch((err) => {
			if (!rejects) return null;

			throw new Error(err);
		});
};
