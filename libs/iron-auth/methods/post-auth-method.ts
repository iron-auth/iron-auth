import type { CredentialsPreCheckResponse } from '../src';
import type { ApiResponseDataType, ProviderType } from '../types';
import { getCsrfToken } from './csrf';
import { type WithFetchOptions, refineDefaultOpts, fetchApiData } from './fetch-api-data';

type Args<T extends ProviderType, Trimmed extends boolean = false> = Trimmed extends true
  ? [opts?: WithFetchOptions<{ data?: never }>]
  : T extends 'credentials'
  ? [type: T, providerId: string, opts: WithFetchOptions<{ data: CredentialsPreCheckResponse }>]
  : [type: T, providerId: string, opts?: WithFetchOptions<{ data?: never }>];

export type PostAuthMethod<
  ResponseType extends ApiResponseDataType,
  Trimmed extends boolean = false,
> = <T extends ProviderType>(...args: Args<T, Trimmed>) => Promise<ResponseType | null>;

/**
 * Make a `POST` request to the auth API endpoint.
 *
 * For providers that require account information, like with credentials providers, the relevant information should also be provided to the data option.
 *
 * If the request fails, the promise will return null, unless the rejects option is set to true, in which case it will throw an error.
 *
 * @param path Path for the API route.
 * @param type Type of authentication provider.
 * @param provider Authentication provider ID.
 * @param opts.data Optional data to send to the provider. This is useful for providers that require you to post the newly linked account's information to them, like credentials providers.
 * @param opts.rejects Whether the promise should reject on an error. By default, it returns null and does not throw the error.
 * @param opts.basePath Base path for the API. Defaults to '/api/auth'.
 * @returns The response from the API, or null if no response was received.
 */
export const postAuthMethod = async <
  ResponseType extends ApiResponseDataType,
  Trimmed extends boolean = false,
>(
  path: string,
  args: Parameters<PostAuthMethod<ResponseType, Trimmed>>,
): Promise<ResponseType | null> => {
  const [type, providerId, opts] =
    args.length === 1
      ? [undefined, undefined, (args as Parameters<PostAuthMethod<ResponseType, true>>)[0]]
      : (args as Parameters<PostAuthMethod<ResponseType, false>>);
  const { basePath, rejects } = refineDefaultOpts(opts);

  let csrfToken: string | undefined;

  try {
    csrfToken = (await getCsrfToken({ basePath, rejects: true })) ?? undefined;
    if (!csrfToken) throw new Error('Failed to fetch CSRF token');
  } catch (err) {
    if (rejects) throw new Error(err as string);
    return null;
  }

  const queryParams =
    type && providerId ? `?${new URLSearchParams({ type, providerId }).toString()}` : '';

  return fetchApiData<ResponseType>(
    `/${path}${queryParams}`,
    {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...opts?.data, csrfToken }),
    },
    { basePath, name: path },
  )
    .then((respData) => respData)
    .catch((err) => {
      if (!rejects) return null;

      throw new Error(err);
    });
};
