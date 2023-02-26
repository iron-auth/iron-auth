import type { IncomingMessage, ServerResponse } from 'http';
import type { JointStatusCodes, ErrorStatusCodes } from '../src/utils/iron-auth-response';

// https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties
type CloudflareEdgeProperties = {
  // ASN of the incoming request, for example, `395747`.
  asn: number;
  // The organization which owns the ASN of the incoming request, for example, `Google Cloud`.
  asOrganization: string;
  // Only set when using Cloudflare Bot Management. Object with the following properties: `score`, `verifiedBot`, `staticResource`, `ja3Hash`, and `detectionIds`. Refer to Bot Management Variables for more details.
  botManagement: object | null;
  // The three-letter IATA airport code of the data center that the request hit, for example, `"DFW"`.
  colo: string;
  // Country of the incoming request. The two-letter country code in the request. This is the same value as that provided in the `CF-IPCountry` header, for example, `"US"`.
  country: string | null;
  // If the country of the incoming request is in the EU, this will return `"1"`. Otherwise, this property will be omitted.
  isEUCountry: '1' | null;
  // HTTP Protocol, for example, "HTTP/2".
  httpProtocol: string;
  // The browser-requested prioritization information in the request object, for example, `"weight=192;exclusive=0;group=3;group-weight=127"`.
  requestPriority: string | null;
  // The cipher for the connection to Cloudflare, for example, `"AEAD-AES128-GCM-SHA256"`.
  tlsCipher: string;
  // Only set when using Cloudflare Access or API Shield (mTLS). Object with the following properties: `certFingerprintSHA1`, `certFingerprintSHA256`, `certIssuerDN`, `certIssuerDNLegacy`, `certIssuerDNRFC2253`, `certIssuerSKI`, `certIssuerSerial`, `certNotAfter`, `certNotBefore`, `certPresented`, `certRevoked`, `certSKI`, `certSerial`, `certSubjectDN`, `certSubjectDNLegacy`, `certSubjectDNRFC2253`, `certVerified`.
  tlsClientAuth: object | null;
  // The TLS version of the connection to Cloudflare, for example, `TLSv1.3`.
  tlsVersion: string;
  // City of the incoming request, for example, `"Austin"`.
  city: string | null;
  // Continent of the incoming request, for example, `"NA".`
  continent: string | null;
  // Latitude of the incoming request, for example, `"30.27130"`.
  latitude: string | null;
  // Longitude of the incoming request, for example, `"-97.74260"`.
  longitude: string | null;
  // Postal code of the incoming request, for example, `"78701"`.
  postalCode: string | null;
  // Metro code (DMA) of the incoming request, for example, `"635"`.
  metroCode: string | null;
  // If known, the ISO 3166-2 name for the first level region associated with the IP address of the incoming request, for example, `"Texas"`.
  region: string | null;
  // If known, the ISO 3166-2 code for the first-level region associated with the IP address of the incoming request, for example, `"TX"`.
  regionCode: string | null;
  // Timezone of the incoming request, for example, `"America/Chicago"`.
  timezone: string;
};
type PartialCfEdgeRequest = Request & { cf: CloudflareEdgeProperties };

// https://nextjs.org/docs/api-reference/next/server#nextrequest
// The custom cookies, geo, etc. functions here are not appreciated in the slightest. The considerate approach would be to put the custom properties in a `vercel` or `next` object like Cloudflare does with `cf`...
type NextEdgeCookie = { value: string; name: string };
type PartialNextEdgeRequest = Request & {
  get cookies(): {
    get size(): number;
    get(...args: [name: string] | [NextEdgeCookie]): NextEdgeCookie | undefined;
    getAll(...args: [name: string] | [NextEdgeCookie] | []): NextEdgeCookie[];
    has(name: string): boolean;
  };
  get geo():
    | {
        city?: string | undefined;
        country?: string | undefined;
        region?: string | undefined;
        latitude?: string | undefined;
        longitude?: string | undefined;
      }
    | undefined;
  get ip(): string | undefined;
};

export type EdgeRequest = Request | PartialCfEdgeRequest | PartialNextEdgeRequest;
export type EdgeResponse = Response;

export type NonEdgeRequest = IncomingMessage & {
  query: Partial<{ [key: string]: string | string[] }>;
  params?: Partial<{ [key: string]: string | string[] }>;
  cookies?: Partial<{ [key: string]: string }>;
  body?: unknown;
};
export type NonEdgeResponse = ServerResponse & {
  json: (body: unknown) => void;
  status: (statusCode: number) => NonEdgeResponse;
  redirect(statusCode: number, url: string): void | NonEdgeResponse;
};

export type IncomingRequest = EdgeRequest | IncomingMessage | NonEdgeRequest;
export type IncomingResponse = EdgeResponse | NonEdgeResponse;

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
