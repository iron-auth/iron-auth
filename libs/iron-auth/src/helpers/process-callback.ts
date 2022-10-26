import type { ApiResponseDataType, ParsedIronAuthConfig } from '../../types';
import type { IronAuthError } from './iron-auth-error';
import { IronAuthResponse } from './iron-auth-response';

type Props = {
  config: ParsedIronAuthConfig;
} & (
  | {
      err: IronAuthError;
      resp?: never;
    }
  | {
      err?: never;
      resp: IronAuthResponse<ApiResponseDataType>;
    }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cbResp = (data: any, val: string | ((data: any) => string)) => {
  return typeof val === 'function' ? val(data) : val;
};

export const processCallback = ({
  config,
  err,
  resp,
}: Props): IronAuthResponse<ApiResponseDataType> => {
  const { redirects } = config;

  if (err) {
    if (redirects?.error) {
      const params = new URLSearchParams({
        error: err.code,
        message: err.message,
      });

      return new IronAuthResponse({
        redirect: {
          code: 'TEMPORARY_REDIRECT',
          url: `${cbResp(err, redirects.error)}?${params.toString()}`,
        },
      });
    }

    return new IronAuthResponse({ err });
  }

  switch (resp.route) {
    case 'signIn': {
      return redirects?.signIn
        ? new IronAuthResponse({
            code: resp.code,
            data: resp.data,
            redirect: { code: 'TEMPORARY_REDIRECT', url: cbResp(resp.data, redirects.signIn) },
            res: resp.res,
          })
        : resp;
    }
    case 'signUp': {
      return redirects?.signUp
        ? new IronAuthResponse({
            code: resp.code,
            data: resp.data,
            redirect: { code: 'TEMPORARY_REDIRECT', url: cbResp(resp.data, redirects.signUp) },
            res: resp.res,
          })
        : resp;
    }
    case 'signOut': {
      return redirects?.signOut
        ? new IronAuthResponse({
            code: resp.code,
            data: resp.data,
            redirect: { code: 'TEMPORARY_REDIRECT', url: cbResp(resp.data, redirects.signOut) },
            res: resp.res,
          })
        : resp;
    }
    default: {
      return resp;
    }
  }
};
