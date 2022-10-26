// import type { NextApiResponse } from 'next';
import type { codeToStatus, redirectCodeToStatus } from '../helpers';

type Props =
  | {
      code: keyof typeof codeToStatus;
      data?: never;
      error: string;
      headers?: Record<string, string>;
      redirect?: never;
    }
  | {
      code?: keyof typeof codeToStatus;
      data?: object | string | number | null;
      error?: never;
      headers?: Record<string, string>;
      redirect?: never;
    }
  | {
      code?: never;
      data?: never;
      error?: never;
      headers?: never;
      redirect: {
        url: string;
        status?: keyof typeof redirectCodeToStatus;
      };
    };

// export const responseHandler = (
//   res?: NextApiResponse,
//   { code = 'OK', error = undefined, data = null, redirect = undefined, headers = {} }: Props = {},
// ): NextApiResponse => {
// if (redirect) {
//   if (res) {
//     return res.redirect(
//       redirectCodeToStatus[redirect.status ?? 'TEMPORARY_REDIRECT'],
//       redirect.url,
//     );
//   }

//   return Response.redirect(
//     redirect.url,
//     redirectCodeToStatus[redirect.status ?? 'TEMPORARY_REDIRECT'],
//   );
// }

// if (res) {
// instanceof ServerResponse
// return res.status(codeToStatus[code]).json(jsonData) as unknown as NextApiResponse;
// }

// const newHeaders = res ? res.headers : new Headers();

// Object.keys(headers).forEach((key) => {
//   const val = headers[key];
//   if (val) newHeaders.set(key, val);
// });

// newHeaders.set('Content-Type', 'application/json;charset=UTF-8');

// return new Response(jsonData, {
//   status: codeToStatus[code],
//   // headers: newHeaders,
// });
// };

export type { Props as ResponseHandlerProps };
