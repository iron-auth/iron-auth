import type { IncomingRequest, InternalRequest } from '../../../types';
import { refineBody, refineCookies, refinePath, refineQueryParams } from '../http-helpers';

export const toInternalRequest = async (req: IncomingRequest): Promise<InternalRequest> => {
	const path = refinePath(req);

	const internalReq: InternalRequest = {
		url: req.url,
		path,
		method: req.method ?? 'GET',

		query: refineQueryParams(req, path),
		body: await refineBody(req),
		cookies: refineCookies(req),

		...('credentials' in req
			? { headers: req.headers, credentials: req.credentials }
			: { headers: req.headers }),
	};

	return internalReq;
};
