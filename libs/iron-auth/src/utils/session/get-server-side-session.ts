import { getIronSession } from 'iron-session/edge';
import type { IncomingRequest, IronAuthConfig, LayoutRequest, ValidSession } from '../../../types';
import { parseConfig } from '../config';
import { getIronOptions } from '../encryption';
import { isValidSession } from './is-valid';

/**
 * Get the session data from the request.
 *
 * @param req The request object.
 * @param config The Iron Auth configuration.
 * @param env The environment variables.
 * @returns The session data.
 */
export const getServerSideSession = async (
	req: IncomingRequest | LayoutRequest,
	config: IronAuthConfig,
	env?: Record<string, string | undefined>,
): Promise<ValidSession> => {
	const parsedConfig = parseConfig(config, env);

	const session = await getIronSession(
		req as IncomingRequest,
		new Response(),
		getIronOptions(parsedConfig),
	);

	return isValidSession(session);
};
