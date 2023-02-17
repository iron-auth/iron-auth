import type { ApiResponseDataType, IronAuthApiResponse } from '../types';

export type SharedFetchOptions = { rejects?: boolean; basePath?: string };
// eslint-disable-next-line @typescript-eslint/ban-types
export type WithFetchOptions<T extends object = {}> = T & SharedFetchOptions;
export const fetchDefaults = { rejects: false, basePath: '/api/auth' };

export const refineDefaultOpts = <T extends WithFetchOptions | undefined>(
  opts: T,
): Required<SharedFetchOptions> => ({
  basePath: opts?.basePath ?? fetchDefaults.basePath,
  rejects: opts?.rejects ?? fetchDefaults.rejects,
});

type FetchArgs = Pick<SharedFetchOptions, 'basePath'> & {
  name?: string;
};

/**
 * Fetches data from the API.
 *
 * @param path API route path.
 * @param options Fetch request options.
 * @param opts.basePath Base path for API routes.
 * @param opts.name Name of the method being called.
 * @returns Promise resolving to the data returned by the API.
 */
export const fetchApiData = <Data extends ApiResponseDataType = null>(
  path: string,
  options?: RequestInit,
  { basePath = fetchDefaults.basePath, name = 'method' }: FetchArgs = {},
) => {
  return new Promise<Data>((res, rej) => {
    fetch(`${basePath}${path}`, options)
      .then((resp) => {
        if (resp.ok) {
          return resp.json() as Promise<IronAuthApiResponse<'unknown', Data> | JSON>;
        }

        throw new Error('Request failed');
      })
      .then((resp) => {
        if ('success' in resp) {
          if (resp.success && resp.data !== undefined) {
            console.debug('Fetched data:', resp.data);

            res(resp.data);
          } else {
            throw new Error(resp.error ?? `${name} response data not found`);
          }
        } else {
          throw new Error('Invalid response');
        }
      })
      .catch((err) => {
        const message =
          (err instanceof Error && err.message) || `Unexpected error fetching ${name}`;

        console.error(`Error fetching ${name}`, message);

        rej(message);
      });
  });
};
