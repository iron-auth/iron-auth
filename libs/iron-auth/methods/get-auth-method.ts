import type { ApiResponseDataType } from '../types';
import type { SharedFetchOptions } from './fetch-api-data';
import { fetchApiData, refineDefaultOpts } from './fetch-api-data';

export type GetAuthMethod<
  T extends ApiResponseDataType,
  ExtraOpts extends object = Record<string, never>,
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
export const getAuthMethod = <ResponseType extends ApiResponseDataType>(
  path: string,
  opts = {},
): Promise<ResponseType | null> => {
  const { rejects, basePath } = refineDefaultOpts(opts);

  return fetchApiData<ResponseType>(`/${path}`, { method: 'GET' }, { basePath, name: path })
    .then((data) => data)
    .catch((err) => {
      if (rejects) throw new Error(err);
      return null;
    });
};
