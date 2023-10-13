import { getIronSession } from 'iron-session/edge';

import type { IncomingRequest, IronAuthConfig } from '../../types';
import {
	getIronOptions,
	IronAuthError,
	parseConfig,
	toActualResponse,
	toInternalRequest,
} from '../utils';
import { processCallback } from './process-callback';
import { requestHandler } from './request-handler';

export type Handler = (...args: Parameters<typeof ironAuthHandler>) => Response;

export const ironAuthHandler = async (
	req: IncomingRequest,
	config: IronAuthConfig,
	env?: Record<string, string | undefined>,
): Promise<Response> => {
	const parsedConfig = parseConfig(config, env);
	const internalRes = new Response();

	try {
		const internalReq = await toInternalRequest(req);

		const session = await getIronSession(
			internalReq as unknown as Request,
			internalRes,
			getIronOptions(parsedConfig),
		);

		const resp = processCallback(
			parsedConfig,
			await requestHandler(internalReq, internalRes, parsedConfig, session),
		);

		// TODO: Logging?

		// we can handle all errors in the catch block below
		if (resp.err) {
			throw resp.err;
		}

		return toActualResponse(internalRes, resp);
	} catch (err) {
		// eslint-disable-next-line no-console
		if (err instanceof IronAuthError && err.status === 500) console.log(err);
		const respErr =
			err instanceof IronAuthError
				? err
				: new IronAuthError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'An unexpected error occurred',
				  });

		const resp = processCallback(parsedConfig, respErr);

		// if (parsedConfig.debug) {
		//   console.error(err);
		// }

		// TODO: Error logging?

		return toActualResponse(internalRes, resp);
	}
};
