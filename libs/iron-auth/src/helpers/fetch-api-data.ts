import type { ApiResponseDataType, IronAuthApiResponse } from '../../types';

type RefetchProps = {
  basePath?: string;
  name?: string;
};

export const fetchApiData = <Data extends ApiResponseDataType = null>(
  path: string,
  options?: RequestInit,
  { basePath = '/api/auth', name }: RefetchProps = {},
) => {
  const sentenceCaseName = name
    ? `${name.slice(0, 1).toUpperCase()}${name.slice(1).toLowerCase()}`
    : 'Data';

  return new Promise<Data>((res, rej) => {
    fetch(`${basePath}${path}`, options)
      .then((resp) => resp.json() as Promise<IronAuthApiResponse<'unknown', Data> | JSON>)
      .then((resp) => {
        if ('success' in resp) {
          if (resp.success && resp.data !== undefined) {
            console.debug('Fetched data:', resp.data);

            res(resp.data);
          } else {
            throw new Error(resp.error ?? `${sentenceCaseName} response data not found`);
          }
        } else {
          throw new Error('Invalid response');
        }
      })
      .catch((err: Error) => {
        const message =
          (typeof err === 'object' && err.message) ||
          `Unexpected error retrieving ${sentenceCaseName.toLowerCase()}`;

        console.error('Error retrieving session', message);

        rej(message);
      });
  });
};
