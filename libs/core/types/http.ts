import type { IncomingMessage, ServerResponse } from 'http';
import type { JointStatusCodes, ErrorStatusCodes } from '../src/helpers/iron-auth-response';

type PartialNextRequest = IncomingMessage & {
  query: Partial<{ [key: string]: string | string[] }>;
  cookies: Partial<{ [key: string]: string }>;
  body: unknown;
};

export type EdgeRequest = Request;
export type EdgeResponse = Response;

export type IncomingRequest = EdgeRequest | IncomingMessage | PartialNextRequest;
export type IncomingResponse = EdgeResponse | ServerResponse;

export type LayoutRequest = {
  headers: Headers;
  credentials: 'same-origin' | 'include';
};

export type InternalRequest = {
  url: string | undefined;
  path: string | string[] | undefined;
  method: 'GET' | 'POST' | string | undefined;
  query: Partial<Record<string, string | string[]>>;
  body: Record<string, unknown>;
  cookies: Partial<{
    [key: string]: string;
  }>;
} & (
  | {
      credentials: RequestCredentials;
      headers: Headers;
    }
  | {
      credentials?: never;
      headers: NodeJS.Dict<string | string[]>;
    }
);

export type ApiResponseDataType = object | string | number | boolean | null;

type FatalResponse = {
  success: false;
  data?: never;
  error: string;
};

type SuccessfulResponse<Data extends ApiResponseDataType> = {
  success: true;
  data: Data;
  error?: never;
};

export type IronAuthApiResponse<
  State extends 'error' | 'success' | 'unknown' = 'unknown',
  Data extends ApiResponseDataType = null,
> = State extends 'unknown'
  ? { code: JointStatusCodes } & (FatalResponse | SuccessfulResponse<Data>)
  : State extends 'success'
  ? { code: JointStatusCodes } & SuccessfulResponse<Data>
  : { code: ErrorStatusCodes } & FatalResponse;
